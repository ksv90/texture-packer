import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import flatDts from 'rollup-plugin-flat-dts';

const tsconfig = 'tsconfig.build.json';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.js', format: 'es', sourcemap: true },
    plugins: [typescript({ tsconfig }), flatDts({ tsconfig, compilerOptions: { declarationMap: true } })],
    external: ['buffer-image-size', 'maxrects-packer', 'sharp'],
  },
]);
