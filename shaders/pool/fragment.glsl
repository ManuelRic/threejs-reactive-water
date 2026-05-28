precision highp float;
precision highp int;

#define USE_WAVE_CAUSTIC_WATER_LEVEL
#include <utils>

varying vec3 pos;


void main() {
  gl_FragColor = vec4(getWallColor(pos), 1.0);

  if (pos.y < getCausticWaterLevel(pos.xz)) {
    gl_FragColor.rgb *= underwaterColor * 1.2;
  }
}
