import * as d3 from 'd3';

// FIPS state codes to state names
const STATE_NAMES = {
    1: "Alabama", 2: "Alaska", 4: "Arizona", 5: "Arkansas", 6: "California",
    8: "Colorado", 9: "Connecticut", 10: "Delaware", 11: "DC", 12: "Florida",
    13: "Georgia", 15: "Hawaii", 16: "Idaho", 17: "Illinois", 18: "Indiana",
    19: "Iowa", 20: "Kansas", 21: "Kentucky", 22: "Louisiana", 23: "Maine",
    24: "Maryland", 25: "Massachusetts", 26: "Michigan", 27: "Minnesota",
    28: "Mississippi", 29: "Missouri", 30: "Montana", 31: "Nebraska",
    32: "Nevada", 33: "New Hampshire", 34: "New Jersey", 35: "New Mexico",
    36: "New York", 37: "North Carolina", 38: "North Dakota", 39: "Ohio",
    40: "Oklahoma", 41: "Oregon", 42: "Pennsylvania", 44: "Rhode Island",
    45: "South Carolina", 46: "South Dakota", 47: "Tennessee", 48: "Texas",
    49: "Utah", 50: "Vermont", 51: "Virginia", 53: "Washington",
    54: "West Virginia", 55: "Wisconsin", 56: "Wyoming"
};

export function getStateName(fipsCode) {
    return STATE_NAMES[fipsCode] || `State ${fipsCode}`;
}

export function buildHierarchy(data, valueAttribute) {
    // Filter out records with missing values for the chosen attribute
    const clean = data.filter(d => {
        const val = d[valueAttribute];
        return val !== "?" && val !== null && val !== undefined && !isNaN(val) && val !== "";
    });

    // Group by state
    const stateMap = d3.group(clean, d => d.state);

    const children = Array.from(stateMap, ([stateCode, communities]) => ({
        name: getStateName(stateCode),
        stateCode: stateCode,
        children: communities.map(c => ({
            name: c.communityname || `Community ${c.index}`,
            value: +c[valueAttribute],
            data: c  // keep reference to original row for cross-linking
        }))
    }));

    // Sort states by name for consistent ordering
    children.sort((a, b) => a.name.localeCompare(b.name));

    return { name: "US Communities", children };
}
