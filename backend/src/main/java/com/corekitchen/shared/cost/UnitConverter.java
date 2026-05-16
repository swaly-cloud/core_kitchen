package com.corekitchen.shared.cost;

import com.corekitchen.ingredients.entity.Unit;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class UnitConverter {

    // Returns the factor to multiply `qty` expressed in `fromUnit` to get the equivalent in `toUnit`.
    // Returns null if the units belong to incompatible families.
    public BigDecimal convert(BigDecimal qty, String fromUnit, Unit toUnit) {
        if (fromUnit == null || toUnit == null) return null;

        Unit from;
        try {
            from = Unit.valueOf(fromUnit.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }

        if (from == toUnit) return qty;

        BigDecimal factor = conversionFactor(from, toUnit);
        if (factor == null) return null;
        return qty.multiply(factor);
    }

    private BigDecimal conversionFactor(Unit from, Unit to) {
        // Mass family: KG, G
        if (isMass(from) && isMass(to)) {
            return toGrams(from).divide(toGrams(to));
        }
        // Volume family: L, ML, CL
        if (isVolume(from) && isVolume(to)) {
            return toMilliliters(from).divide(toMilliliters(to));
        }
        // Discrete: PIECE, BUNCH, PORTION — no cross-unit conversion
        return null;
    }

    private boolean isMass(Unit u) { return u == Unit.KG || u == Unit.G; }
    private boolean isVolume(Unit u) { return u == Unit.L || u == Unit.ML || u == Unit.CL; }

    private BigDecimal toGrams(Unit u) {
        return switch (u) {
            case KG -> BigDecimal.valueOf(1000);
            case G  -> BigDecimal.ONE;
            default -> null;
        };
    }

    private BigDecimal toMilliliters(Unit u) {
        return switch (u) {
            case L  -> BigDecimal.valueOf(1000);
            case CL -> BigDecimal.TEN;
            case ML -> BigDecimal.ONE;
            default -> null;
        };
    }
}
