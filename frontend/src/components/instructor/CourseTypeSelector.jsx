import React from "react";
import { BookOpen, Users } from "lucide-react";

export default function CourseTypeSelector({
  selectedType,
  onChange,
  disabled = false,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Online-Led Option */}
        <label
          className={`flex flex-1 cursor-pointer rounded-lg border-2 p-4 transition ${
            selectedType === "online-led"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          } ${disabled ? "opacity-50" : ""}`}
        >
          <input
            type="radio"
            name="course_type"
            value="online-led"
            checked={selectedType === "online-led"}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="mt-1"
          />
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Online-Led</h3>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Self-paced learning. Students can enroll directly without needing
              an invitation. Perfect for independent learners.
            </p>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              <li>✓ Self-paced learning</li>
              <li>✓ No teacher invitations needed</li>
              <li>✓ Public course catalog</li>
              <li>✓ Students join directly</li>
            </ul>
          </div>
        </label>

        {/* Instructor-Led Option */}
        <label
          className={`flex flex-1 cursor-pointer rounded-lg border-2 p-4 transition ${
            selectedType === "instructor-led"
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          } ${disabled ? "opacity-50" : ""}`}
        >
          <input
            type="radio"
            name="course_type"
            value="instructor-led"
            checked={selectedType === "instructor-led"}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="mt-1"
          />
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-green-600" />
              <h3 className="font-semibold text-gray-900">Instructor-Led</h3>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Teacher manages enrollment. Students need an invitation from you
              to join. Great for structured courses and cohorts.
            </p>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              <li>✓ Teacher manages enrollment</li>
              <li>✓ Students invited by email</li>
              <li>✓ Structured cohorts</li>
              <li>✓ Better class control</li>
            </ul>
          </div>
        </label>
      </div>

      {/* Additional Info */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can change the course type anytime from the
          course settings, but instructor-led courses require active enrollment
          management.
        </p>
      </div>
    </div>
  );
}
