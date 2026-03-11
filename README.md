**⚡ Divide & Conquer Algorithm Visualizer**
An interactive, browser-based visualizer for eight classic Divide & Conquer algorithms. Each algorithm includes a live animation, recurrence relation, time complexity, space complexity, and a plain-language description — all updating instantly when you switch algorithms.

**📁 Project Structure**
Divide_Conquer_Visualizer/
├── index.html    # HTML structure and layout
├── style.css     # All styling, theming, and animations
└── script.js     # Algorithm logic, step recording, and rendering
No build tools, no dependencies, no installation required. Just open index.html in any modern browser.

**🚀 Getting Started**

Download or clone the project folder.
Make sure all three files (index.html, style.css, script.js) are in the same directory.
Open index.html in a browser (Chrome, Firefox, Edge, or Safari).
Select an algorithm, click ↺ Generate Data, then click ▶ Start.


**🧠 Algorithms Covered**
AlgorithmTypeRecurrenceTime ComplexityMerge SortSortingT(n) = 2T(n/2) + Θ(n)Θ(n log n)Quick SortSortingT(n) = T(k) + T(n−k−1) + Θ(n)Θ(n log n) avgMin & MaxArrayT(n) = 2T(n/2) + Θ(1)Θ(n)Maximum SubarrayArrayT(n) = 2T(n/2) + Θ(n)Θ(n log n)Matrix MultiplicationMatrixT(n) = 8T(n/2) + Θ(n²)Θ(n³)Strassen's AlgorithmMatrixT(n) = 7T(n/2) + Θ(n²)Θ(n^2.807)Closest Pair of PointsGeometricT(n) = 2T(n/2) + Θ(n log n)Θ(n log n)Convex HullGeometricT(n) = 2T(n/2) + Θ(n)Θ(n log n)

**🎨 Visualization Types**
Bar Chart — used by Merge Sort, Quick Sort, Min & Max, and Maximum Subarray.
Color states during animation:
ColorMeaningDark blueUnsorted / untouchedMedium blueActive range being processedYellowTwo elements being comparedRedPivot element (Quick Sort)GreenConfirmed sorted position
SVG Canvas — used by Closest Pair of Points and Convex Hull. Renders points on a coordinate grid with connecting lines, divide lines, and hull polygons drawn directly in SVG.
Matrix Tables — used by Matrix Multiplication and Strassen's Algorithm. Displays Matrix A, Matrix B, and the computed result side by side, with result cells highlighted.

**🕹️ Controls**
ControlDescriptionAlgorithm dropdownSelects the algorithm and immediately updates the info panel↺ Generate DataCreates a fresh random dataset for the selected algorithmSpeed slider (1–10)Controls animation speed; 1 is slowest, 10 is fastest▶ StartRuns the algorithm on the current dataset

**📐 Info Panel**
The right sidebar updates automatically whenever you change the algorithm and shows:
**
Algorithm name**
Description — plain-language explanation of how the divide & conquer strategy works
Recurrence Relation — the exact recurrence (e.g. T(n) = 2T(n/2) + Θ(n))
Time Complexity — derived from the recurrence via the Master Theorem
Space Complexity — auxiliary space used by the algorithm


**🔧 Implementation Notes**

Merge Sort — Records all compare and set operations before animating, enabling smooth replay at any speed. Correctly copies all remaining elements after the main merge loop.
Quick Sort — Uses last-element pivot with Lomuto partition scheme. Pivot is highlighted in red throughout its partition phase.
Min & Max — Uses ≤ 3n/2 − 2 comparisons (more efficient than the naive 2n − 2).
Maximum Subarray — Implements the full three-case D&C approach: left half, right half, and crossing subarray.
Strassen's Algorithm — Fully implements the 7-product formula (M₁–M₇), not standard matrix multiplication.
Convex Hull — Uses Andrew's monotone chain algorithm (O(n log n)).
Closest Pair — Brute-force for the demo dataset size (n = 20), with the divide line visualized.
