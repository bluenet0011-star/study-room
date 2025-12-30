export function parseStudentId(input: string): { grade: number; class: number; number: number; isValid: boolean } {
    // Standard format: 10101 (Grade 1 digit, Class 2 digits, Number 2 digits)
    // Or 1-1-1, 1 1 1

    // Remove non-digit chars except dash/space for splitting
    const digitsOnly = input.replace(/[^0-9]/g, '');

    // Case 1: 5 digits (e.g., 10101) => 1, 01, 01
    // Case 2: 4 digits (e.g., 1011) => 1, 01, 1 ? Or 1st Grade, 01 class, 1 number?
    // User said "usually front 1 digit grade, then 2 digits class, 2 digits number".

    if (digitsOnly.length === 5) {
        const grade = parseInt(digitsOnly.substring(0, 1));
        const classNum = parseInt(digitsOnly.substring(1, 3));
        const number = parseInt(digitsOnly.substring(3, 5));
        return { grade, class: classNum, number, isValid: true };
    }

    // Case 3: "1-3-11" or "1 3 11"
    const split = input.split(/[- ]+/);
    if (split.length === 3) {
        const grade = parseInt(split[0]);
        const classNum = parseInt(split[1]);
        const number = parseInt(split[2]);
        if (!isNaN(grade) && !isNaN(classNum) && !isNaN(number)) {
            return { grade, class: classNum, number, isValid: true };
        }
    }

    return { grade: 0, class: 0, number: 0, isValid: false };
}

export function formatStudentId(grade: number, classNum: number, number: number): string {
    // 10101 format
    return `${grade}${classNum.toString().padStart(2, '0')}${number.toString().padStart(2, '0')}`;
}
