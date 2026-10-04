"""
Day 8 showcase - Deterministic Verification
AI Investment Committee (minimal demo)

The idea in one line:
  an AI's plan is only trustworthy if it has to pass a deterministic check.

Here a (rule-based) "research agent" proposes portfolio constraints that happen
to contradict each other. A deterministic checker catches the contradiction,
measures it, and hands the reason back. The agent then revises and we re-check.

Plain Python - no libraries, no API key. Run:  python day8_feasibility.py
"""


def line():
    print("-" * 60)


def show_constraints(constraints):
    for sector in constraints:
        lo = constraints[sector]["min"]
        hi = constraints[sector]["max"]
        print("  " + sector.ljust(12) + "min " + pct(lo) + "   max " + pct(hi))


def pct(x):
    # 0.40 -> " 40%"
    return str(int(round(x * 100))).rjust(3) + "%"


# --- STEP 2: the deterministic checker (no AI inside - this is the point) ---
def check_feasibility(constraints):
    conflicts = []
    for sector in constraints:
        lo = constraints[sector]["min"]
        hi = constraints[sector]["max"]
        if lo > hi:
            gap = round((lo - hi) * 100)          # size of the conflict, in points
            conflicts.append({"sector": sector, "min": lo, "max": hi, "gap": gap})
    feasible = len(conflicts) == 0
    return feasible, conflicts


# --- STEP 4: the agent revises, using the checker's feedback ---
def revise(constraints, conflicts):
    for c in conflicts:
        sector = c["sector"]
        # relax the lower bound down to the upper bound so min <= max holds
        constraints[sector]["min"] = constraints[sector]["max"]
        print("  " + sector.ljust(12) + "min " + pct(c["min"]) + " -> " + pct(c["max"]))
    return constraints


def run_demo():
    print("=" * 60)
    print("  AI Investment Committee - Deterministic Verification")
    print("  Day 8: probabilistic reasoning forced to answer to math")
    print("=" * 60)

    # STEP 1 - the agent proposes constraints (Technology is self-contradictory)
    print("\nSTEP 1  Research agent proposes constraints")
    line()
    constraints = {
        "Technology": {"min": 0.40, "max": 0.25},   # <-- impossible on purpose
        "Healthcare": {"min": 0.10, "max": 0.30},
        "Energy":     {"min": 0.05, "max": 0.20},
    }
    show_constraints(constraints)

    # STEP 2 - deterministic check
    print("\nSTEP 2  Deterministic feasibility check")
    line()
    feasible, conflicts = check_feasibility(constraints)
    for c in conflicts:
        print("  [X] " + c["sector"] + ": min " + pct(c["min"]) +
              " > max " + pct(c["max"]) + "  ->  conflict of " + str(c["gap"]) + " pp")
    print("  Result:", "FEASIBLE" if feasible else "INFEASIBLE")

    if feasible:
        return

    # STEP 3 - explain the conflict (this is what gets fed back to the agent)
    print("\nSTEP 3  Explain the conflict (fed back to the agent)")
    line()
    for c in conflicts:
        print("  " + c["sector"] + " cannot be at least " + pct(c["min"]).strip() +
              " and at most " + pct(c["max"]).strip() + " at the same time.")
        print("  The lower bound exceeds the upper bound by " + str(c["gap"]) + " pp.")

    # STEP 4 - agent revises
    print("\nSTEP 4  Agent revises (relax the lower bound to the max)")
    line()
    constraints = revise(constraints, conflicts)

    # STEP 5 - re-check
    print("\nSTEP 5  Re-check")
    line()
    feasible, conflicts = check_feasibility(constraints)
    if feasible:
        print("  Result: FEASIBLE  [OK]")
        print("  A valid allocation now exists.")
    else:
        print("  Result: still INFEASIBLE")

    print("=" * 60)
    print("  Takeaway: the AI proposed, the math judged, the AI revised.")
    print("  Claim -> test -> evidence -> revision.")
    print("=" * 60)


run_demo()
