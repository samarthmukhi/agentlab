"""
Day 4 showcase - Structured Outputs & Two-Layer Validation
AI Investment Committee (minimal demo)

The idea in one line:
  valid JSON is NOT the same as a sensible answer.

An "LLM" turns a fuzzy investment thesis into structured constraints. Some are
perfectly well-formed JSON but still nonsense (a -5 weight, a 150% weight).
Two validation layers catch different problems:
  LAYER 1 (schema):   is the shape / type / field right?
  LAYER 2 (business): is the value actually meaningful (a weight in 0..1)?

Plain Python - no libraries, no API key. Run:  python day4_validation.py
"""

ALLOWED_TYPES = ["sector_max", "sector_min"]


def line():
    print("-" * 60)


def is_number(x):
    return type(x) == int or type(x) == float


# --- LAYER 1: schema check (shape, types, allowed 'type') ---
def schema_check(c):
    if "type" not in c:
        return False, "missing 'type'"
    if "sector" not in c:
        return False, "missing 'sector'"
    if "value" not in c:
        return False, "missing 'value'"
    if c["type"] not in ALLOWED_TYPES:
        return False, "'" + str(c["type"]) + "' is not an allowed type"
    if not is_number(c["value"]):
        return False, "'value' is not a number"
    return True, ""


# --- LAYER 2: business check (the value must mean something) ---
def business_check(c):
    v = c["value"]
    if v < 0:
        return False, "value " + str(v) + " is below 0"
    if v > 1:
        return False, "value " + str(v) + " is above 1"
    return True, ""


def show_input(constraints):
    print("The LLM turned the thesis into these structured constraints:")
    i = 1
    for c in constraints:
        value = c.get("value", "(missing)")
        type_ = c.get("type", "(missing)")
        sector = c.get("sector", "(missing)")
        print("  " + str(i) + ". " + str(type_).ljust(11) +
              str(sector).ljust(12) + "value " + str(value))
        i += 1


def run_demo():
    print("=" * 60)
    print("  Thesis -> Structured Constraints -> Two-Layer Validation")
    print("  Day 4: schema-valid is NOT the same as business-valid")
    print("=" * 60 + "\n")

    # What the "LLM" produced from a fuzzy thesis.
    constraints = [
        {"type": "sector_max", "sector": "Technology", "value": 0.25},   # good
        {"type": "sector_max", "sector": "Energy",     "value": -5},     # schema ok, business bad
        {"type": "sector_min", "sector": "Health",     "value": 1.5},    # schema ok, business bad
        {"type": "sector_cap", "sector": "Finance",    "value": 0.30},   # schema bad: type
        {"type": "sector_max", "sector": "Utilities"},                   # schema bad: no value
    ]
    show_input(constraints)

    print("\nLAYER 1  Schema check  (shape + types + allowed 'type')")
    print("LAYER 2  Business check (value must be between 0 and 1)")
    line()

    accepted = 0
    i = 1
    for c in constraints:
        ok, reason = schema_check(c)
        if not ok:
            print("  " + str(i) + ". REJECT (schema): " + reason)
        else:
            ok, reason = business_check(c)
            if not ok:
                print("  " + str(i) + ". REJECT (business): " + reason)
            else:
                print("  " + str(i) + ". ACCEPT")
                accepted += 1
        i += 1

    line()
    print("  Accepted " + str(accepted) + " of " + str(len(constraints)) + " constraints.")

    print("\nThe point:")
    print("  #2 (-5) and #3 (1.5) are perfectly valid JSON numbers -")
    print("  the schema is happy. Only the BUSINESS layer catches that")
    print("  a -5 weight or a 150% weight is nonsense.")
    print("=" * 60)


run_demo()
