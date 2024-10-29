
uniform float uTime;
uniform vec3 uColor;
uniform float uSoundFreq;

varying vec3 vPosition;
varying vec3 vNormal;

void main(){

    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);

    // Normal
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing)
        normal *= - 1.0;

    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal)+ 1.0;
    fresnel = pow(fresnel, 3.0);

     // Falloff
    float falloff = smoothstep(0.8, 0.0, fresnel);

    float holographic = stripes * fresnel;
    holographic += fresnel * 1.25;
    holographic *= falloff;

    float soundF = mod(uSoundFreq * 0.01, 1.0);

    gl_FragColor = vec4( soundF, uColor.y * soundF, uColor.z , holographic);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}