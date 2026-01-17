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

  // API base URL - change this to your backend URL
  const API_URL = "https://murraypilltrackerserver.vercel.app/api"

  // Fetch pills from backend
  const fetchPills = async () => {
    try {
      const response = await fetch(`${API_URL}/pills`)
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
        `${API_URL}/logs?startDate=${startDate}&endDate=${endDate}`,
      )
      if (!response.ok) throw new Error("Failed to fetch logs")
      const data = await response.json()
      setLogs(data)
    } catch (err) {
      setError("Failed to load pill logs. Make sure the backend is running.")
      console.error(err)
    }
  }

  // Load data on mount and when month changes
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
        const response = await fetch(`${API_URL}/pills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newPillName.trim() }),
        })

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
      const response = await fetch(`${API_URL}/pills/${pillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      })

      if (!response.ok) throw new Error("Failed to deactivate pill")

      await fetchPills()
      setError(null)
    } catch (err) {
      setError("Failed to remove pill. Make sure the backend is running.")
      console.error(err)
    }
  }

  const togglePillLog = async (pillId, date) => {
    const dateStr = date.toISOString().split("T")[0]
    const existingLog = logs.find(
      (log) => log.pill_id === pillId && log.date === dateStr,
    )

    try {
      if (existingLog) {
        // Delete log
        const response = await fetch(`${API_URL}/logs/${pillId}/${dateStr}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete log")
      } else {
        // Create log
        const response = await fetch(`${API_URL}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pillId,
            date: dateStr,
            givenBy: givenBy || "User",
          }),
        })

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 flex items-center gap-2 text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Pill className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">
                Dog Pill Tracker
              </h1>
            </div>
            <button
              onClick={() => setShowAddPill(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Pill</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Who's giving the pills today?
            </label>
            <input
              type="text"
              value={givenBy}
              onChange={(e) => setGivenBy(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            />
          </div>

          {showAddPill && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-indigo-50 rounded-lg">
              <input
                type="text"
                value={newPillName}
                onChange={(e) => setNewPillName(e.target.value)}
                placeholder="Enter pill name..."
                className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-indigo-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                onKeyPress={(e) => e.key === "Enter" && addPill()}
              />
              <div className="flex gap-2">
                <button
                  onClick={addPill}
                  className="bg-indigo-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddPill(false)
                    setNewPillName("")
                  }}
                  className="bg-gray-300 text-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              Active Pills
            </h2>
            {pills.length === 0 ? (
              <p className="text-gray-500 italic text-sm sm:text-base">
                No pills added yet. Click "Add Pill" to get started.
              </p>
            ) : (
              <div className="grid gap-2 sm:gap-3">
                {pills.map((pill) => (
                  <div
                    key={pill.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
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
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 py-1 sm:py-2 text-xs sm:text-base"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                  className={`aspect-square border rounded-lg p-1 sm:p-2 ${
                    today ? "bg-indigo-50 border-indigo-500" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
                      today ? "text-indigo-600" : "text-gray-600"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    {pills.map((pill) => {
                      const given = isPillGiven(pill.id, date)
                      return (
                        <button
                          key={pill.id}
                          onClick={() => togglePillLog(pill.id, date)}
                          className={`w-full p-0.5 sm:p-1 rounded text-[10px] sm:text-xs flex items-center justify-center gap-0.5 sm:gap-1 transition ${
                            given
                              ? "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300 active:bg-gray-400"
                          }`}
                          title={pill.name}
                        >
                          {given && <Check className="w-2 h-2 sm:w-3 sm:h-3" />}
                          <span className="truncate">
                            {pill.name.substring(0, 6)}
                          </span>
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
