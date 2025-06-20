import PrimeUI from 'tailwindcss-primeui';

module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        fontFamily: {
            sans: [
                '"Inter"',
                {
                    fontFeatureSettings: '"cv11", "ss01"',
                    fontVariationSettings: '"opsz" 32'
                },
            ],
        },
    },
    plugins: [PrimeUI],
}
