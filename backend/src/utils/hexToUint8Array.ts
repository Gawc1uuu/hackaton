
export default function hexToUint8Array(hexString: string): Uint8Array {
    // Ensure the hex string has an even number of characters
    if (hexString.length % 2 !== 0) {
        throw new Error('Invalid hexadecimal string');
    }

    const uint8Array = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i += 2) {
        uint8Array[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return uint8Array;
}