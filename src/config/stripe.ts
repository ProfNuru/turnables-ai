export const PLANS = [
  {
    name: "Free",
    slug: "free",
    quota: 10,
    pagesPerPdf: 5,
    price: {
      amount: 0,
      priceIds: {
        test: "free",
        production: "free",
      },
    },
    paymentLink: null,
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 25,
    pagesPerPdf: 25,
    price: {
      amount: 30,
      priceIds: {
        test: "PLN_auvdie0csrdg9qe",
        production: "PLN_auvdie0csrdg9qe",
      },
    },
    paymentLink: "https://paystack.com/pay/turnables-ai-pro",
  },
  {
    name: "Pro+",
    slug: "pro+",
    quota: 25,
    pagesPerPdf: 30,
    price: {
      amount: 50,
      priceIds: {
        test: "PLN_sp3l09kcll86has",
        production: "PLN_sp3l09kcll86has",
      },
    },
    paymentLink: "https://paystack.com/pay/turnables-ai-pro-plus",
  },
];
