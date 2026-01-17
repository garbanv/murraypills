"use client"
import React, { useState, useEffect } from "react"
import {
  Calendar,
  Plus,
  Pill,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react"

const DogPillTracker = () => {
  const [pills, setPills] = useState([])
  const [logs, setLogs] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddPill, setShowAddPill] = useState(false)
  const [newPillName, setNewPillName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [givenBy, setGivenBy] = useState("")

  const API_URL = "http://localhost:3001"

  const fetchPills = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pills`,
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      )
      if (!response.ok) throw new Error("Failed to fetch pills")
      const data = await response.json()
      setPills(data)
    } catch (err) {
      setError("Failed to load pills. Make sure the backend is running.")
      console.error(err)
    }
  }

  // Fetch logs for current month
  const fetchLogs = async (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const startDate = new Date(year, month, 1).toISOString().split("T")[0]
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0]

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/logs?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      )
      if (!response.ok) throw new Error("Failed to fetch logs")
      const data = await response.json()
      setLogs(data)
    } catch (err) {
      setError("Failed to load pill logs. Make sure the backend is running.")
      console.error(err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchPills(), fetchLogs(currentDate)])
      setLoading(false)
    }
    loadData()
  }, [currentDate])

  const addPill = async () => {
    if (newPillName.trim()) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pills`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ name: newPillName.trim() }),
          },
        )

        if (!response.ok) throw new Error("Failed to add pill")

        await fetchPills()
        setNewPillName("")
        setShowAddPill(false)
        setError(null)
      } catch (err) {
        setError("Failed to add pill. Make sure the backend is running.")
        console.error(err)
      }
    }
  }

  const deactivatePill = async (pillId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pills/${pillId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ active: false }),
        },
      )

      if (!response.ok) throw new Error("Failed to deactivate pill")

      await fetchPills()
      setError(null)
    } catch (err) {
      setError("Failed to remove pill. Make sure the backend is running.")
      console.error(err)
    }
  }

  const togglePillLog = async (pillId, date) => {
    const adjustedDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    const dateStr = adjustedDate.toISOString().split("T")[0]
    const existingLog = logs.find(
      (log) =>
        log.pill_id === pillId &&
        new Date(log.date).toISOString().split("T")[0] === dateStr,
    )

    console.log("dateStr", dateStr)

    try {
      if (existingLog) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/logs/${pillId}/${dateStr}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        )

        if (!response.ok) throw new Error("Failed to delete log")
      } else {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/logs`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              pillId,
              date: dateStr,
              givenBy: givenBy || "User",
            }),
          },
        )

        if (!response.ok) throw new Error("Failed to create log")
      }

      await fetchLogs(currentDate)
      setError(null)
    } catch (err) {
      setError("Failed to update pill log. Make sure the backend is running.")
      console.error(err)
    }
  }

  const isPillGiven = (pillId, date) => {
    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    return logs.some((log) => log.pill_id === pillId && log.date === dateStr)
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const changeMonth = (increment) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + increment,
        1,
      ),
    )
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pill tracker...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Pill className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                Murray Pill Tracker
              </h1>
            </div>
            <button
              onClick={() => setShowAddPill(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Pill
            </button>
          </div>

          {/*      <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who's giving the pills today?
            </label>
            <input
              type="text"
              value={givenBy}
              onChange={(e) => setGivenBy(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div> */}

          {showAddPill && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <input
                type="text"
                value={newPillName}
                onChange={(e) => setNewPillName(e.target.value)}
                placeholder="Enter pill name..."
                className="w-full px-4 py-2 border border-indigo-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => e.key === "Enter" && addPill()}
              />
              <div className="flex gap-2">
                <button
                  onClick={addPill}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddPill(false)
                    setNewPillName("")
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Active Pills
            </h2>
            {pills.length === 0 ? (
              <p className="text-gray-500 italic">
                No pills added yet. Click "Add Pill" to get started.
              </p>
            ) : (
              <div className="grid md:grid-cols-6 grid-cols-3 gap-x-3 items-center md:px-0 px-5">
                {pills.map((pill) => (
                  <div
                    key={pill.id}
                    className="  flex gap-3 justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-700">
                      {pill.name}
                    </span>
                    <button
                      onClick={() => deactivatePill(pill.id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      title="Remove pill"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                {/*  <div className="grid gap-3">
                  {pills.map((pill) => (
                    <div
                      key={pill.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-700">
                        {pill.name}
                      </span>
                      <button
                        onClick={() => deactivatePill(pill.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove pill"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div> */}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = new Date(year, month, day)
              const today = isToday(date)

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded-lg p-2 ${
                    today ? "bg-indigo-50 border-indigo-500" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      today ? "text-indigo-600" : "text-gray-600"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {pills.map((pill) => {
                      const given = isPillGiven(pill.id, date)

                      return (
                        <button
                          key={pill.id}
                          onClick={() => togglePillLog(pill.id, date)}
                          className={`w-full p-1 rounded text-xs flex items-center justify-center gap-1 transition ${
                            given
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                          title={pill.name}
                        >
                          {given && <Check className="w-3 h-3" />}
                          <span className="truncate">{pill.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DogPillTracker
