
import { generateAIBrainResponse } from '../lib/ai-brain';
import { ALL_CARS } from '../data/cars';

const TEST_CASES = [
    {
        name: "Model: Versa",
        input: "quiero un versa",
        expectedModelKeyword: "Versa"
    },
    {
        name: "Capability: Offroad (Todo Terreno)",
        input: "quiero un todo terreno",
        expectedTags: ["4x4", "AWD", "Offroad"]
    },
    {
        name: "Usage: Work/Cargo (Arquitecto Carga)",
        input: "soy arquitecto, quiero una camioneta de transporte de carga",
        expectedTypes: ["Truck", "Van", "Pickup"],
        forbiddenTypes: ["Sedan", "Hatchback", "Coupe"]
    },
    {
        name: "Budget: 200,000.00 (Decimal)",
        input: "no se que quiero, pero trengo 200,000.00",
        expectedMaxPrice: 220000
    },
    {
        name: "Sorting: Cheapest",
        input: "quiero el auto más barato que tengas",
        checkSort: "Ascending"
    }
];

async function runTests() {
    console.log("🚀 Starting AI Specific Attribute Tests...\n");
    let passed = 0;
    let failed = 0;

    for (const test of TEST_CASES) {
        console.log(`🧪 Testing: ${test.name}`);
        console.log(`📝 Input: "${test.input}"`);

        const response = generateAIBrainResponse(test.input);
        const recommendations = response.recommendations || [];

        console.log(`🤖 Response: ${response.content}`);
        console.log(`🚗 Recommendations: ${recommendations.map(r => `${r.make} ${r.model} ($${r.price})`).join(', ')}`);

        let testPassed = true;
        const reasons: string[] = [];

        if (recommendations.length === 0) {
            testPassed = false;
            reasons.push("❌ No recommendations returned");
        }

        // 1. Model Check
        if (test.expectedModelKeyword) {
            const hasModel = recommendations.some(r => r.model.includes(test.expectedModelKeyword!));
            if (!hasModel) {
                testPassed = false;
                reasons.push(`❌ Expecting model '${test.expectedModelKeyword}'`);
            }
        }

        // 2. Tags Check (Offroad)
        if (test.expectedTags) {
            const hasTag = recommendations.some(r => {
                // We don't have tags in the simplified response, but we can verify against expected 'correct' cars if we knew IDs.
                // Heuristic: Check if model name or response content implies capabilities, or just check known 4x4s.
                // Simpler: Check if ANY recommendation is a known 4x4 (Wrangler, Raptor, Bronco, Defender, Pickup 4x4)
                const name = (r.make + " " + r.model).toLowerCase();
                return name.includes('wrangler') || name.includes('raptor') || name.includes('defender') || name.includes('4x4') || name.includes('lobo') || name.includes('hilux');
            });
            if (!hasTag) {
                // Strict check: fails if generic SUVs returned
                testPassed = false;
                reasons.push("❌ None of the cars seem to be 'Todo Terreno' (4x4/Offroad)");
            }
        }

        // 3. Types Check (Cargo)
        if (test.expectedTypes) {
            // We can check if generic SUVs (CR-V, Sorento) were returned when we wanted Trucks/Vans.
            // Heurstic: If result is CR-V/CX-90/Sorento, it fails.
            const isGenericSUV = recommendations.some(r => r.model.includes('CR-V') || r.model.includes('Sorento') || r.model.includes('CX-90'));
            if (isGenericSUV) {
                testPassed = false;
                reasons.push("❌ Returned generic SUVs for a Cargo request");
            }
        }

        // 4. Budget Check
        if (test.expectedMaxPrice) {
            const expensive = recommendations.some(r => r.price > test.expectedMaxPrice!);
            if (expensive) {
                testPassed = false;
                reasons.push(`❌ Budget exceeded (Expected < ${test.expectedMaxPrice})`);
            }
        }

        // 5. Sorting Check
        if (test.checkSort === 'Ascending') {
            const prices = recommendations.map(r => r.price);
            const isAscending = prices.every((p, i) => i === 0 || p >= prices[i - 1]);
            // Also check absolute value - generic SUVs are > 500k. Cheapest should be < 100k or low 100s.
            const isCheap = prices[0] < 400000;
            if (!isAscending || !isCheap) {
                testPassed = false;
                reasons.push("❌ Not sorted by cheapest or returns expensive cars");
            }
        }

        if (testPassed) {
            console.log("✅ PASS");
            passed++;
        } else {
            console.log("❌ FAIL");
            reasons.forEach(r => console.log(r));
            failed++;
        }
        console.log("---------------------------------------------------\n");
    }

    console.log(`📊 Summary: ${passed} Passed, ${failed} Failed`);
}

runTests();
