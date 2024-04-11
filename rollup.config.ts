import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import flatDts from 'rollup-plugin-flat-dts';

const tsconfig = 'tsconfig.build.json';

export default defineConfig([
  {
    input: 'src/texture-packer/index.ts',
    output: { file: 'dist/index.js', format: 'es', sourcemap: true },
    plugins: [typescript({ tsconfig }), flatDts({ tsconfig, compilerOptions: { declarationMap: true } })],
    external: ['buffer-image-size', 'maxrects-packer', 'sharp'],
  },
  {
    input: 'src/asset-packer-bin/index.ts',
    output: { file: 'bin/assets-pack.js', format: 'es', banner: '#!/usr/bin/env node' },
    plugins: [typescript({ tsconfig, sourceMap: false, inlineSources: false })],
    external: ['buffer-image-size', 'maxrects-packer', 'sharp', 'valibot'],
  },
]);
