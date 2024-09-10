import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const dev = process.env.BUILD === 'development';

const terserOptions = {
    compress: {
        // pure_funcs: ['console.debug'],
    },
};

export default [
    {
        input: 'src/core/index.ts',
        output: [
            {
                file: 'public/main.js',
                format: 'iife',
                name: 'BcyArchive',
                sourcemap: dev,
            },
        ],
        plugins: [
            typescript(), //
            ...[dev ? [] : [terser(terserOptions)]],
        ],
    },
];
