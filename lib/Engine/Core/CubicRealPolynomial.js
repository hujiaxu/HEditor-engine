import QuadraticRealPolynomial from './QuadraticRealPolynomial';
export default class QuarticRealPolynomial {
    static computeRealRoots;
}
QuarticRealPolynomial.computeRealRoots = (a, b, c, d) => {
    let roots;
    let ratio;
    if (a === 0.0) {
        // Quadratic function: b * x^2 + c * x + d = 0.
        return QuadraticRealPolynomial.computeRealRoots(b, c, d);
    }
    else if (b === 0.0) {
        if (c === 0.0) {
            if (d === 0.0) {
                // 3rd order monomial: a * x^3 = 0.
                return [0.0, 0.0, 0.0];
            }
            // a * x^3 + d = 0
            ratio = -d / a;
            const root = ratio < 0.0 ? -Math.pow(-ratio, 1.0 / 3.0) : Math.pow(ratio, 1.0 / 3.0);
            return [root, root, root];
        }
        else if (d === 0.0) {
            // x * (a * x^2 + c) = 0.
            roots = QuadraticRealPolynomial.computeRealRoots(a, 0, c);
            // Return the roots in ascending order.
            if (roots.length === 0) {
                return [0.0];
            }
            return [roots[0], 0.0, roots[1]];
        }
        // Deflated cubic polynomial: a * x^3 + c * x + d= 0.
        return computeRealRoots(a, 0, c, d);
    }
    else if (c === 0.0) {
        if (d === 0.0) {
            // x^2 * (a * x + b) = 0.
            ratio = -b / a;
            if (ratio < 0.0) {
                return [ratio, 0.0, 0.0];
            }
            return [0.0, 0.0, ratio];
        }
        // a * x^3 + b * x^2 + d = 0.
        return computeRealRoots(a, b, 0, d);
    }
    else if (d === 0.0) {
        // x * (a * x^2 + b * x + c) = 0
        roots = QuadraticRealPolynomial.computeRealRoots(a, b, c);
        // Return the roots in ascending order.
        if (roots.length === 0) {
            return [0.0];
        }
        else if (roots[1] <= 0.0) {
            return [roots[0], roots[1], 0.0];
        }
        else if (roots[0] >= 0.0) {
            return [0.0, roots[0], roots[1]];
        }
        return [roots[0], 0.0, roots[1]];
    }
};
function computeRealRoots(a, b, c, d) {
    const A = a;
    const B = b / 3.0;
    const C = c / 3.0;
    const D = d;
    const AC = A * C;
    const BD = B * D;
    const B2 = B * B;
    const C2 = C * C;
    const delta1 = A * C - B2;
    const delta2 = A * D - B * C;
    const delta3 = B * D - C2;
    const discriminant = 4.0 * delta1 * delta3 - delta2 * delta2;
    let temp;
    let temp1;
    if (discriminant < 0.0) {
        let ABar;
        let CBar;
        let DBar;
        if (B2 * BD >= AC * C2) {
            ABar = A;
            CBar = delta1;
            DBar = -2.0 * B * delta1 + A * delta2;
        }
        else {
            ABar = D;
            CBar = delta3;
            DBar = -D * delta2 + 2.0 * C * delta3;
        }
        const s = DBar < 0.0 ? -1.0 : 1.0; // This is not Math.Sign()!
        const temp0 = -s * Math.abs(ABar) * Math.sqrt(-discriminant);
        temp1 = -DBar + temp0;
        const x = temp1 / 2.0;
        const p = x < 0.0 ? -Math.pow(-x, 1.0 / 3.0) : Math.pow(x, 1.0 / 3.0);
        const q = temp1 === temp0 ? -p : -CBar / p;
        temp = CBar <= 0.0 ? p + q : -DBar / (p * p + q * q + CBar);
        if (B2 * BD >= AC * C2) {
            return [(temp - B) / A];
        }
        return [-D / (temp + C)];
    }
    const CBarA = delta1;
    const DBarA = -2.0 * B * delta1 + A * delta2;
    const CBarD = delta3;
    const DBarD = -D * delta2 + 2.0 * C * delta3;
    const squareRootOfDiscriminant = Math.sqrt(discriminant);
    const halfSquareRootOf3 = Math.sqrt(3.0) / 2.0;
    let theta = Math.abs(Math.atan2(A * squareRootOfDiscriminant, -DBarA) / 3.0);
    temp = 2.0 * Math.sqrt(-CBarA);
    let cosine = Math.cos(theta);
    temp1 = temp * cosine;
    let temp3 = temp * (-cosine / 2.0 - halfSquareRootOf3 * Math.sin(theta));
    const numeratorLarge = temp1 + temp3 > 2.0 * B ? temp1 - B : temp3 - B;
    const denominatorLarge = A;
    const root1 = numeratorLarge / denominatorLarge;
    theta = Math.abs(Math.atan2(D * squareRootOfDiscriminant, -DBarD) / 3.0);
    temp = 2.0 * Math.sqrt(-CBarD);
    cosine = Math.cos(theta);
    temp1 = temp * cosine;
    temp3 = temp * (-cosine / 2.0 - halfSquareRootOf3 * Math.sin(theta));
    const numeratorSmall = -D;
    const denominatorSmall = temp1 + temp3 < 2.0 * C ? temp1 + C : temp3 + C;
    const root3 = numeratorSmall / denominatorSmall;
    const E = denominatorLarge * denominatorSmall;
    const F = -numeratorLarge * denominatorSmall - denominatorLarge * numeratorSmall;
    const G = numeratorLarge * numeratorSmall;
    const root2 = (C * F - B * G) / (-B * F + C * E);
    if (root1 <= root2) {
        if (root1 <= root3) {
            if (root2 <= root3) {
                return [root1, root2, root3];
            }
            return [root1, root3, root2];
        }
        return [root3, root1, root2];
    }
    if (root1 <= root3) {
        return [root2, root1, root3];
    }
    if (root2 <= root3) {
        return [root2, root3, root1];
    }
    return [root3, root2, root1];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3ViaWNSZWFsUG9seW5vbWlhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvQ29yZS9DdWJpY1JlYWxQb2x5bm9taWFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sdUJBQXVCLE1BQU0sMkJBQTJCLENBQUE7QUFFL0QsTUFBTSxDQUFDLE9BQU8sT0FBTyxxQkFBcUI7SUFDeEMsTUFBTSxDQUFDLGdCQUFnQixDQUtFO0NBQzFCO0FBRUQscUJBQXFCLENBQUMsZ0JBQWdCLEdBQUcsQ0FDdkMsQ0FBUyxFQUNULENBQVMsRUFDVCxDQUFTLEVBQ1QsQ0FBUyxFQUNULEVBQUU7SUFDRixJQUFJLEtBQUssQ0FBQTtJQUNULElBQUksS0FBSyxDQUFBO0lBQ1QsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDZCwrQ0FBK0M7UUFDL0MsT0FBTyx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQzFELENBQUM7U0FBTSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNkLG1DQUFtQztnQkFDbkMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDeEIsQ0FBQztZQUVELGtCQUFrQjtZQUNsQixLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2QsTUFBTSxJQUFJLEdBQ1IsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1lBQ3pFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQzNCLENBQUM7YUFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNyQix5QkFBeUI7WUFDekIsS0FBSyxHQUFHLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFhLENBQUE7WUFFckUsdUNBQXVDO1lBQ3ZDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2QsQ0FBQztZQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xDLENBQUM7UUFFRCxxREFBcUQ7UUFDckQsT0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNyQyxDQUFDO1NBQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZCx5QkFBeUI7WUFDekIsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNkLElBQUksS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUNoQixPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUMxQixDQUFDO1lBQ0QsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDMUIsQ0FBQztRQUNELDZCQUE2QjtRQUM3QixPQUFPLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3JDLENBQUM7U0FBTSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNyQixnQ0FBZ0M7UUFDaEMsS0FBSyxHQUFHLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFhLENBQUE7UUFFckUsdUNBQXVDO1FBQ3ZDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxDQUFDO2FBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDbEMsQ0FBQzthQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xDLENBQUM7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNsQyxDQUFDO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO0lBQ2xFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNYLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7SUFDakIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUNqQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFWCxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2hCLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNoQixNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2hCLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ3pCLE1BQU0sTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUM1QixNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUV6QixNQUFNLFlBQVksR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFBO0lBQzVELElBQUksSUFBSSxDQUFBO0lBQ1IsSUFBSSxLQUFLLENBQUE7SUFFVCxJQUFJLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLElBQUksQ0FBQTtRQUNSLElBQUksSUFBSSxDQUFBO1FBQ1IsSUFBSSxJQUFJLENBQUE7UUFFUixJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQ3ZCLElBQUksR0FBRyxDQUFDLENBQUE7WUFDUixJQUFJLEdBQUcsTUFBTSxDQUFBO1lBQ2IsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQTtRQUN2QyxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksR0FBRyxDQUFDLENBQUE7WUFDUixJQUFJLEdBQUcsTUFBTSxDQUFBO1lBQ2IsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQTtRQUN2QyxDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQSxDQUFDLDJCQUEyQjtRQUM3RCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUM1RCxLQUFLLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFBO1FBRXJCLE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUE7UUFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ3JFLE1BQU0sQ0FBQyxHQUFHLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUE7UUFFMUMsSUFBSSxHQUFHLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO1FBRTNELElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDdkIsT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLENBQUM7UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFBO0lBQ3BCLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQTtJQUU1QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUE7SUFDcEIsTUFB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