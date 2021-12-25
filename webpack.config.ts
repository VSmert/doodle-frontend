module.exports = {
    module: {
        rules: [
            {
                test: /\.worker\.ts$/,
                use: { loader: 'worker-loader' },
            },
        ],
    },
};
