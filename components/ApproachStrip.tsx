import RevealSection from "@/components/RevealSection";
import { Fade } from "@/components/RevealText";

const STEPS = [
  { index: "01", label: "Understand the business" },
  { index: "02", label: "Define the right system" },
  { index: "03", label: "Build with purpose" },
  { index: "04", label: "Evolve as needed" },
];

/** Dark four-step strip between About Us and Work. */
export default function ApproachStrip() {
  return (
    <RevealSection className="border-y border-hairline bg-ink text-canvas">
      <div className="shell">
        <ol aria-label="How we work" className="grid grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Fade
              as="li"
              key={step.index}
              // The `i % 2` paddings below are what make the phone 2x2 work and
              // are deliberately untouched. From `lg` the cell becomes one of
              // four equal columns, so its padding is evened out and the
              // contents centre inside it.
              className={`py-12 lg:px-6 lg:py-16 lg:text-center ${
                // Right rule between columns; bottom rule where the grid wraps.
                i < STEPS.length - 1 ? "lg:border-r lg:border-canvas/15" : ""
              } ${i % 2 === 0 ? "border-r border-canvas/15 lg:border-r" : ""} ${
                i < 2 ? "border-b border-canvas/15 lg:border-b-0" : ""
              } ${i % 2 === 1 ? "pl-6" : "pr-6"}`}
            >
              <p
                aria-hidden="true"
                className="tnum font-medium tracking-[-0.03em]"
                style={{ fontSize: "clamp(2.8rem, 5vw, 5rem)", lineHeight: "1" }}
              >
                {step.index}
              </p>
              {/* The label carries the meaning now, not the figure, so it sits
                  at /70 rather than the old /45 caption tone. */}
              <p className="micro mt-5 text-canvas/70">{step.label}</p>
            </Fade>
          ))}
        </ol>
      </div>
    </RevealSection>
  );
}
