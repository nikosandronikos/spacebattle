export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export function degToRad(degrees) {
    return degrees * DEG_TO_RAD;
}

export function radToDeg(radians) {
    return radians * RAD_TO_DEG;
}
