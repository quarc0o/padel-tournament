import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center",
              stepIdx !== steps.length - 1 && "flex-1"
            )}
          >
            <div className="flex flex-col items-center gap-2 flex-1">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    step.id < currentStep &&
                      "border-blue-600 bg-blue-600 text-white",
                    step.id === currentStep &&
                      "border-blue-600 bg-white text-blue-600 shadow-md",
                    step.id > currentStep &&
                      "border-gray-300 bg-white text-gray-500"
                  )}
                >
                  {step.id < currentStep ? (
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Connecting Line */}
                {stepIdx !== steps.length - 1 && (
                  <div
                    className={cn(
                      "hidden sm:block w-full h-0.5 mx-2 transition-all",
                      step.id < currentStep ? "bg-blue-600" : "bg-gray-300"
                    )}
                    style={{ minWidth: "40px" }}
                  />
                )}
              </div>

              {/* Step Label */}
              <div className="text-center">
                <p
                  className={cn(
                    "text-xs sm:text-sm font-medium transition-colors",
                    step.id <= currentStep ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {step.name}
                </p>
                <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
