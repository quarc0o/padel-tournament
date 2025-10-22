"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/ui/StepIndicator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Step 1: Tournament Type Selection
function TournamentTypeStep({
  selectedType,
  onSelect,
}: {
  selectedType: string;
  onSelect: (type: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Choose Tournament Type
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select the format that best fits your event
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Americano Card */}
        <button
          onClick={() => onSelect("americano")}
          className={`p-8 rounded-2xl border-2 transition-all text-left hover:shadow-lg ${
            selectedType === "americano"
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-4xl">🔄</div>
              {selectedType === "americano" && (
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Americano
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Rotation-based tournament where you play with different partners each round
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Social and friendly format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Play with everyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Great for beginners</span>
                </li>
              </ul>
            </div>
          </div>
        </button>

        {/* Mexicano Card */}
        <button
          onClick={() => onSelect("mexicano")}
          className={`p-8 rounded-2xl border-2 transition-all text-left hover:shadow-lg ${
            selectedType === "mexicano"
              ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
              : "border-gray-300 dark:border-gray-700 hover:border-purple-400"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-4xl">⚡</div>
              {selectedType === "mexicano" && (
                <div className="text-purple-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Mexicano
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Dynamic tournament where matchups are based on current rankings
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Competitive and balanced</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Adaptive pairings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Skill-based matchups</span>
                </li>
              </ul>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// Step 2: Target Points Selection
function TargetPointsStep({
  selectedPoints,
  onSelect,
}: {
  selectedPoints: number;
  onSelect: (points: number) => void;
}) {
  const pointOptions = [
    { value: 16, icon: "⚡", duration: "3-5 min", description: "Quick matches" },
    { value: 21, icon: "⏱️", duration: "5-8 min", description: "Standard matches" },
    { value: 24, icon: "🎯", duration: "8-10 min", description: "Moderate matches" },
    { value: 32, icon: "🏆", duration: "12-15 min", description: "Long matches" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Choose Target Points
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Combined score of both teams will equal this number
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Example Explanation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                How it works
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Each match is played until the combined score equals your target points.
              </p>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Example with 21 points:
                </p>
                <div className="space-y-1 font-mono text-sm">
                  <p className="text-gray-900 dark:text-white">Team A: 12 - Team B: 9 = 21 ✓</p>
                  <p className="text-gray-900 dark:text-white">Team A: 15 - Team B: 6 = 21 ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Points Options Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {pointOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`p-6 rounded-2xl border-2 transition-all text-left hover:shadow-lg ${
                selectedPoints === option.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                  : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{option.icon}</div>
                {selectedPoints === option.value && (
                  <div className="text-blue-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {option.value} Points
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {option.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{option.duration} per match</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Player Input
function PlayersStep({
  players,
  onPlayersChange,
}: {
  players: string[];
  onPlayersChange: (players: string[]) => void;
}) {
  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;

    // If typing in the last input and it's not empty, add a new empty slot
    if (index === players.length - 1 && name.trim() !== "") {
      newPlayers.push("");
    }

    // Remove empty slots from the end (but keep at least one empty slot)
    while (newPlayers.length > 1 &&
           newPlayers[newPlayers.length - 1] === "" &&
           newPlayers[newPlayers.length - 2] === "") {
      newPlayers.pop();
    }

    onPlayersChange(newPlayers);
  };

  const removePlayer = (index: number) => {
    const newPlayers = players.filter((_, i) => i !== index);
    // Ensure there's always at least one empty input
    if (newPlayers.length === 0 || newPlayers[newPlayers.length - 1] !== "") {
      newPlayers.push("");
    }
    onPlayersChange(newPlayers);
  };

  const filledPlayers = players.filter((p) => p.trim() !== "");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Add Players
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start typing to add players - new fields appear automatically
        </p>
      </div>

      {/* Player Count Display */}
      <div className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-center gap-3">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-semibold text-gray-900 dark:text-white">
            {filledPlayers.length} {filledPlayers.length === 1 ? "player" : "players"} added
          </p>
        </div>
        {filledPlayers.length >= 4 && filledPlayers.length % 4 === 0 && (
          <p className="text-center text-sm text-green-600 dark:text-green-400 mt-2">
            ✓ Perfect for a {filledPlayers.length / 4} court tournament
          </p>
        )}
      </div>

      {/* Player Name Inputs */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-3">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex items-center gap-3 group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <input
                type="text"
                value={player}
                onChange={(e) => updatePlayer(index, e.target.value)}
                placeholder={index === 0 ? "Enter first player name" : "Enter player name"}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus={index === 0}
              />
              {player.trim() !== "" && (
                <button
                  onClick={() => removePlayer(index)}
                  className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove player"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {player.trim() === "" && players.length > 1 && index !== players.length - 1 && (
                <div className="w-10" /> // Spacer for alignment
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        {filledPlayers.length < 4 && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You need at least 4 players to start a tournament. Keep adding!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 4: Summary
function SummaryStep({
  tournamentType,
  targetPoints,
  players,
}: {
  tournamentType: string;
  targetPoints: number;
  players: string[];
}) {
  const filledPlayers = players.filter((p) => p.trim() !== "");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Review & Create
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Double-check everything before creating your tournament
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Tournament Details Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tournament Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Format:</span>
              <span className="font-semibold text-gray-900 dark:text-white capitalize">
                {tournamentType}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Target Points:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                Sum to {targetPoints}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Players:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {filledPlayers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Players List Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Registered Players
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {filledPlayers.map((player, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold">
                  {index + 1}
                </div>
                <span className="text-gray-900 dark:text-white font-medium">
                  {player}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function CreateTournamentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [tournamentType, setTournamentType] = useState("");
  const [targetPoints, setTargetPoints] = useState(0);
  const [players, setPlayers] = useState<string[]>([""]);

  const steps = [
    { id: 1, name: "Format", description: "Tournament type" },
    { id: 2, name: "Points", description: "Target score" },
    { id: 3, name: "Players", description: "Add participants" },
    { id: 4, name: "Review", description: "Confirm details" },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return tournamentType !== "";
      case 2:
        return targetPoints > 0;
      case 3:
        return players.filter((p) => p.trim() !== "").length >= 4;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateTournament = () => {
    // TODO: Save tournament to database
    console.log({
      tournamentType,
      targetPoints,
      players: players.filter((p) => p.trim() !== ""),
    });
    // For now, just redirect to home
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Create Tournament
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="mb-12 min-h-[500px]">
          {currentStep === 1 && (
            <TournamentTypeStep
              selectedType={tournamentType}
              onSelect={setTournamentType}
            />
          )}
          {currentStep === 2 && (
            <TargetPointsStep
              selectedPoints={targetPoints}
              onSelect={setTargetPoints}
            />
          )}
          {currentStep === 3 && (
            <PlayersStep players={players} onPlayersChange={setPlayers} />
          )}
          {currentStep === 4 && (
            <SummaryStep
              tournamentType={tournamentType}
              targetPoints={targetPoints}
              players={players}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="min-w-[120px]"
          >
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={!canProceed()}
              className="min-w-[120px]"
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreateTournament}
              disabled={!canProceed()}
              className="min-w-[120px]"
            >
              Create Tournament
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
