import { calculatePlatformFee, BUSINESS_RULES } from "../lib/fiscal-utils";

function testCommissions() {
    console.log("=== CLINKAR COMMISSION TEST ===");

    const cases = [
        { price: 80000, desc: "Auto muy económico (< 120k)" },
        { price: 119900, desc: "Cerca del límite inferior" },
        { price: 120100, desc: "Justo arriba del límite" },
        { price: 500000, desc: "Auto de gama media" },
    ];

    cases.forEach(c => {
        const fee = calculatePlatformFee(c.price);
        const variableOrig = c.price * BUSINESS_RULES.PLATFORM_VARIABLE_RATE;
        const baseOrig = BUSINESS_RULES.PLATFORM_BASE_FEE;
        const totalOrig = variableOrig + baseOrig;
        const bonus = c.price < BUSINESS_RULES.INCENTIVE_THRESHOLD ? BUSINESS_RULES.INSPECTION_TOTAL : 0;

        console.log(`\nCase: ${c.desc}`);
        console.log(`Price: $${c.price}`);
        console.log(`Total Original: $${totalOrig.toFixed(2)}`);
        console.log(`Bonus Aplicado: $${bonus}`);
        console.log(`Comisión Final Clinkar: $${fee.toFixed(2)}`);
        console.log(`Ahorro Porcentaje: ${(((totalOrig - fee) / totalOrig) * 100).toFixed(1)}%`);
    });
}

testCommissions();
