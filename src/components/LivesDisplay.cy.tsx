import { LivesDisplay } from "./LivesDisplay";

describe("LivesDisplay", () => {
  it("renders 3 hearts when all lives remain", () => {
    cy.mount(<LivesDisplay livesRemaining={3} />);

    // Should have 3 hearts total
    cy.get("svg").should("have.length", 3);

    // All should be filled (red)
    cy.get("svg.fill-red-500").should("have.length", 3);
  });

  it("renders 2 filled and 1 empty heart when 2 lives remain", () => {
    cy.mount(<LivesDisplay livesRemaining={2} />);

    cy.get("svg").should("have.length", 3);
    cy.get("svg.fill-red-500").should("have.length", 2);
    cy.get("svg.fill-gray-300").should("have.length", 1);
  });

  it("renders 1 filled and 2 empty hearts when 1 life remains", () => {
    cy.mount(<LivesDisplay livesRemaining={1} />);

    cy.get("svg").should("have.length", 3);
    cy.get("svg.fill-red-500").should("have.length", 1);
    cy.get("svg.fill-gray-300").should("have.length", 2);
  });

  it("renders all empty hearts when 0 lives remain", () => {
    cy.mount(<LivesDisplay livesRemaining={0} />);

    cy.get("svg").should("have.length", 3);
    cy.get("svg.fill-red-500").should("have.length", 0);
    cy.get("svg.fill-gray-300").should("have.length", 3);
  });

  it("renders hearts with proper styling", () => {
    cy.mount(<LivesDisplay livesRemaining={2} />);

    // Check that filled hearts have correct classes
    cy.get("svg.fill-red-500").first().should("have.class", "text-red-500");

    // Check that empty hearts have correct classes
    cy.get("svg.fill-gray-300").should("have.class", "text-gray-300");
  });
});
