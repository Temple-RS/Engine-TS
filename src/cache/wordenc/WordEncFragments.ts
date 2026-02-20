import WordEnc from '#/cache/wordenc/WordEnc.js';

export default class WordEncFragments {
    readonly fragments: number[] = [];

    filter(chars: string[]): void {
        this.filterFragments(chars);
    }

    private filterFragments(chars: string[]): void {
        let index = 0;
        let count = 0;
        let startIndex = 0;
        while (true) {
            let numberIndex;
            if ((numberIndex = this.indexOfNumber(chars, index)) === -1) {
                return;
            }

            let symbolFound = false;
            for (let i = index; i >= 0 && i < numberIndex && !symbolFound; i++) {
                if (!WordEnc.isSymbol(chars[i]) && !WordEnc.isLowercaseAlpha(chars[i])) {
                    symbolFound = true;
                }
            }

            if (symbolFound) {
                count = 0;
            }

            if (count === 0) {
                startIndex = numberIndex;
            }

            index = this.indexOfNonNumber(numberIndex, chars);
            let value = 0;
            for (let i = numberIndex; i < index; i++) {
                value = value * 10 + (chars[i].charCodeAt(0) - 48);
            }

            if (value <= 255 && index - numberIndex <= 8) {
                count++;
            } else {
                count = 0;
            }

            if (count === 4) {
                for (let i = startIndex; i < index; i++) {
                    chars[i] = '*';
                }
                count = 0;
            }
        }
    }

    isBadFragment(chars: string[]): boolean {
        if (WordEnc.isNumericalChars(chars)) {
            return true;
        }

        const value = this.getInteger(chars);
        const fragments = this.fragments;
        const fragmentsLength = fragments.length;

        if (value === fragments[0] || value === fragments[fragmentsLength - 1]) {
            return true;
        }

        let start = 0;
        let end = fragmentsLength - 1;

        while (start <= end) {
            const mid = ((start + end) / 2) | 0;
            if (value === fragments[mid]) {
                return true;
            } else if (value < fragments[mid]) {
                end = mid - 1;
            } else {
                start = mid + 1;
            }
        }
        return false;
    }

    private getInteger(chars: string[]): number {
        if (chars.length > 6) {
            return 0;
        }
        let value = 0;
        for (let index = 0; index < chars.length; index++) {
            const char = chars[chars.length - index - 1];
            if (WordEnc.isLowercaseAlpha(char)) {
                value = value * 38 + char.charCodeAt(0) + 1 - 'a'.charCodeAt(0);
            } else if (char == "'") {
                value = value * 38 + 27;
            } else if (WordEnc.isNumerical(char)) {
                value = value * 38 + char.charCodeAt(0) + 28 - '0'.charCodeAt(0);
            } else if (char != '\u0000') {
                return 0;
            }
        }
        return value;
    }

    private indexOfNumber(chars: string[], offset: number): number {
        for (let index = offset; index < chars.length && index >= 0; index++) {
            if (WordEnc.isNumerical(chars[index])) {
                return index;
            }
        }
        return -1;
    }

    private indexOfNonNumber(offset: number, chars: string[]): number {
        for (let index = offset; index < chars.length && index >= 0; index++) {
            if (!WordEnc.isNumerical(chars[index])) {
                return index;
            }
        }
        return chars.length;
    }
}