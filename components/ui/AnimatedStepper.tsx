'use client'

import React, {
  useState,
  Children,
  useRef,
  useLayoutEffect,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Check } from 'lucide-react'

export interface AnimatedStepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  initialStep?: number
  onStepChange?: (step: number) => void
  /** Fired when the user clicks the primary button on the last step. */
  onFinalStepCompleted?: () => void
  canGoNext?: (step: number) => boolean
  stepCircleContainerClassName?: string
  stepContainerClassName?: string
  contentClassName?: string
  footerClassName?: string
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  backButtonText?: string
  nextButtonText?: string
  finalButtonText?: string
  disableStepIndicators?: boolean
  footerLoading?: boolean
  /** When true (default), the wizard stays visible after the final action. */
  persistAfterFinal?: boolean
  renderStepIndicator?: (props: {
    step: number
    currentStep: number
    onStepClick: (clicked: number) => void
  }) => ReactNode
}

export function AnimatedStepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  canGoNext,
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  finalButtonText = 'Complete',
  disableStepIndicators = false,
  footerLoading = false,
  persistAfterFinal = true,
  renderStepIndicator,
  className = '',
  ...rest
}: AnimatedStepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep)
  const [direction, setDirection] = useState<number>(0)
  const stepsArray = Children.toArray(children)
  const totalSteps = stepsArray.length
  const isCompleted = !persistAfterFinal && currentStep > totalSteps
  const isLastStep = currentStep === totalSteps
  const nextAllowed = canGoNext ? canGoNext(currentStep) : true

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep)
    if (newStep > totalSteps) {
      onFinalStepCompleted()
    } else {
      onStepChange(newStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      updateStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (!isLastStep && nextAllowed) {
      setDirection(1)
      updateStep(currentStep + 1)
    }
  }

  const handleFinal = () => {
    if (!nextAllowed || footerLoading) return
    if (persistAfterFinal) {
      onFinalStepCompleted()
      return
    }
    setDirection(1)
    updateStep(totalSteps + 1)
  }

  return (
    <div className={`animated-stepper ${className}`.trim()} {...rest}>
      <div className={`animated-stepper__shell ${stepCircleContainerClassName}`.trim()}>
        <div className={`animated-stepper__indicators ${stepContainerClassName}`.trim()}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1
            const isNotLastStep = index < totalSteps - 1
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: (clicked) => {
                      if (disableStepIndicators) return
                      if (canGoNext && clicked > currentStep) {
                        for (let s = currentStep; s < clicked; s++) {
                          if (!canGoNext(s)) return
                        }
                      }
                      setDirection(clicked > currentStep ? 1 : -1)
                      updateStep(clicked)
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={(clicked) => {
                      if (canGoNext && clicked > currentStep) {
                        for (let s = currentStep; s < clicked; s++) {
                          if (!canGoNext(s)) return
                        }
                      }
                      setDirection(clicked > currentStep ? 1 : -1)
                      updateStep(clicked)
                    }}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            )
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`animated-stepper__content ${contentClassName}`.trim()}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={`animated-stepper__footer ${footerClassName}`.trim()}>
            <div
              className={`animated-stepper__footer-row ${currentStep !== 1 ? 'animated-stepper__footer-row--split' : ''}`}
            >
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="animated-stepper__back"
                  disabled={footerLoading}
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleFinal : handleNext}
                disabled={!nextAllowed || footerLoading}
                className="animated-stepper__next dash-tools-btn"
                {...nextButtonProps}
              >
                {footerLoading && isLastStep
                  ? 'Please wait…'
                  : isLastStep
                    ? finalButtonText
                    : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = '',
}: {
  isCompleted: boolean
  currentStep: number
  direction: number
  children: ReactNode
  className?: string
}) {
  const [parentHeight, setParentHeight] = useState<number>(0)

  return (
    <motion.div
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight || 'auto' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={(h) => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: ReactNode
  direction: number
  onHeightReady: (height: number) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!containerRef.current) return
    onHeightReady(containerRef.current.offsetHeight)

    const ro = new ResizeObserver(() => {
      if (containerRef.current) onHeightReady(containerRef.current.offsetHeight)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [children, onHeightReady])

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? -20 : 20,
    opacity: 0,
  }),
}

export function Step({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="animated-stepper__step">
      {title ? <h3 className="animated-stepper__step-title">{title}</h3> : null}
      <div className="animated-stepper__step-body">{children}</div>
    </div>
  )
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators = false,
}: {
  step: number
  currentStep: number
  onClickStep: (clicked: number) => void
  disableStepIndicators?: boolean
}) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete'

  return (
    <button
      type="button"
      onClick={() => !disableStepIndicators && onClickStep(step)}
      disabled={disableStepIndicators}
      className={`animated-stepper__indicator animated-stepper__indicator--${status}`}
      aria-label={`Step ${step}`}
      aria-current={status === 'active' ? 'step' : undefined}
    >
      {status === 'complete' ? <Check className="size-4" aria-hidden /> : <span>{step}</span>}
      {status === 'active' ? <span className="animated-stepper__indicator-glow" aria-hidden /> : null}
    </button>
  )
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="animated-stepper__connector" aria-hidden>
      <motion.div
        className="animated-stepper__connector-fill"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isComplete ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      />
    </div>
  )
}

export default AnimatedStepper
