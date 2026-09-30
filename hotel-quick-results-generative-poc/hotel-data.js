/* Mock hotel datasets for the generative-UI POC.
   Same three sources as the rest of this prototype (Featured / Egencia
   Preferred / Company Preferred), same Seattle hotels/prices as
   panel-layout-mechanics.html, reused here as the fixed "ground truth" the
   reasoning layer chooses how to present. optionalData intentionally varies
   per hotel — per design-decisions.md #7, most cards do not have every
   data point available. */

const DATASET_TITLES = {
  "featured": "Featured",
  "egencia-preferred": "Egencia Preferred",
  "company-preferred": "Company Preferred"
};

const HOTEL_DATASETS = {

  "featured": [
    {
      id: "grand-hyatt-seattle", name: "Grand Hyatt Seattle", stars: 4,
      distanceMiles: 0.3, distanceLabel: "0.3 miles away",
      reviewsScoreValue: 4.8, reviewsScoreLabel: "4.8/5 Exceptional (1,842 reviews)",
      price: 904, priceWithTaxesLabel: "$975 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["recommended"], sustainabilityCert: false, coworkerPct: null, perkStrip: "Offer in policy rate", colleagueReviews: "4.6/5 (12 reviews)", paymentCvvNote: false }
    },
    {
      id: "fairmont-olympic-seattle", name: "Fairmont Olympic Hotel Seattle", stars: 4,
      distanceMiles: 0.5, distanceLabel: "0.5 miles away",
      reviewsScoreValue: 4.6, reviewsScoreLabel: "4.6/5 Exceptional (2,204 reviews)",
      price: 612, priceWithTaxesLabel: "$659 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: [], sustainabilityCert: true, coworkerPct: null, perkStrip: null, colleagueReviews: null, paymentCvvNote: false }
    },
    {
      id: "the-charter-hotel-seattle", name: "The Charter Hotel Seattle", stars: 4,
      distanceMiles: 0.8, distanceLabel: "0.8 miles away",
      reviewsScoreValue: 4.5, reviewsScoreLabel: "4.5/5 Excellent (943 reviews)",
      price: 389, priceWithTaxesLabel: "$420 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: [], sustainabilityCert: false, coworkerPct: "44% of coworker bookings", perkStrip: null, colleagueReviews: null, paymentCvvNote: false }
    },
    {
      id: "thompson-seattle", name: "Thompson Seattle", stars: 4,
      distanceMiles: 0.6, distanceLabel: "0.6 miles away",
      reviewsScoreValue: 4.5, reviewsScoreLabel: "4.5/5 Excellent (611 reviews)",
      price: 455, priceWithTaxesLabel: "$491 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: [], sustainabilityCert: true, coworkerPct: null, perkStrip: null, colleagueReviews: "4.3/5 (5 reviews)", paymentCvvNote: false }
    },
    {
      id: "kimpton-palladian-hotel", name: "Kimpton Palladian Hotel", stars: 4,
      distanceMiles: 0.4, distanceLabel: "0.4 miles away",
      reviewsScoreValue: 4.3, reviewsScoreLabel: "4.3/5 Excellent (760 reviews)",
      price: 298, priceWithTaxesLabel: "$322 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["negotiated"], sustainabilityCert: false, coworkerPct: null, perkStrip: null, colleagueReviews: null, paymentCvvNote: false }
    }
  ],

  "egencia-preferred": [
    {
      id: "the-alexis-royal-sonesta", name: "The Alexis Royal Sonesta Hotel Seattle", stars: 4,
      distanceMiles: 0.44, distanceLabel: "0.44 miles away",
      reviewsScoreValue: 4.7, reviewsScoreLabel: "4.7/5 Exceptional (523 reviews)",
      price: 256, priceWithTaxesLabel: "$278 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["egencia-preferred"], sustainabilityCert: false, coworkerPct: "31% of coworker bookings", perkStrip: "Close to searched location. 4-star hotel.", colleagueReviews: "4.6/5 (9 reviews)", paymentCvvNote: false }
    },
    {
      id: "citizenm-seattle-slu", name: "citizenM Seattle South Lake Union", stars: 3,
      distanceMiles: 0.6, distanceLabel: "0.6 miles away",
      reviewsScoreValue: 4.5, reviewsScoreLabel: "4.5/5 Exceptional (398 reviews)",
      price: 211, priceWithTaxesLabel: "$228 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["egencia-preferred"], sustainabilityCert: false, coworkerPct: null, perkStrip: null, colleagueReviews: null, paymentCvvNote: false }
    },
    {
      id: "motif-seattle", name: "Motif Seattle", stars: 4,
      distanceMiles: 0.3, distanceLabel: "0.3 miles away",
      reviewsScoreValue: 4.4, reviewsScoreLabel: "4.4/5 Exceptional (1,180 reviews)",
      price: 234, priceWithTaxesLabel: "$253 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["egencia-preferred"], sustainabilityCert: false, coworkerPct: null, perkStrip: null, colleagueReviews: null, paymentCvvNote: true }
    },
    {
      id: "hyatt-place-seattle-downtown", name: "Hyatt Place Seattle Downtown", stars: 3,
      distanceMiles: 0.7, distanceLabel: "0.7 miles away",
      reviewsScoreValue: 4.2, reviewsScoreLabel: "4.2/5 Very Good (287 reviews)",
      price: 198, priceWithTaxesLabel: "$214 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["egencia-preferred"], sustainabilityCert: true, coworkerPct: null, perkStrip: null, colleagueReviews: null, paymentCvvNote: false }
    },
    {
      id: "renaissance-seattle-hotel", name: "Renaissance Seattle Hotel", stars: 4,
      distanceMiles: 0.5, distanceLabel: "0.5 miles away",
      reviewsScoreValue: 4.4, reviewsScoreLabel: "4.4/5 Exceptional (705 reviews)",
      price: 267, priceWithTaxesLabel: "$289 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["egencia-preferred"], sustainabilityCert: false, coworkerPct: "37% of coworker bookings", perkStrip: null, colleagueReviews: "4.1/5 (4 reviews)", paymentCvvNote: false }
    }
  ],

  "company-preferred": [
    {
      id: "hilton-seattle-airport", name: "Hilton Seattle Airport & Conference Center", stars: 4,
      distanceMiles: 11.68, distanceLabel: "11.68 miles away",
      reviewsScoreValue: 4.1, reviewsScoreLabel: "4.1/5 Very Good (1,340 reviews)",
      price: 141, priceWithTaxesLabel: "$152 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["company-preferred"], sustainabilityCert: false, coworkerPct: null, perkStrip: null, colleagueReviews: null, paymentCvvNote: false }
    },
    {
      id: "hilton-motif-seattle", name: "Hilton Motif Seattle", stars: 4,
      distanceMiles: 0.12, distanceLabel: "0.12 miles away",
      reviewsScoreValue: 4.3, reviewsScoreLabel: "4.3/5 Excellent (1,662 reviews)",
      price: 187, priceWithTaxesLabel: "$202 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["company-preferred"], sustainabilityCert: false, coworkerPct: "22% of coworker bookings", perkStrip: null, colleagueReviews: null, paymentCvvNote: false }
    },
    {
      id: "sheraton-grand-seattle", name: "Sheraton Grand Seattle", stars: 4,
      distanceMiles: 0.5, distanceLabel: "0.5 miles away",
      reviewsScoreValue: 4.2, reviewsScoreLabel: "4.2/5 Very Good (2,015 reviews)",
      price: 203, priceWithTaxesLabel: "$219 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["company-preferred"], sustainabilityCert: false, coworkerPct: null, perkStrip: "Free cancellation until 24 hrs before check-in", colleagueReviews: null, paymentCvvNote: true }
    },
    {
      id: "doubletree-seattle-airport", name: "DoubleTree by Hilton Seattle Airport", stars: 3,
      distanceMiles: 10.9, distanceLabel: "10.9 miles away",
      reviewsScoreValue: 4.0, reviewsScoreLabel: "4.0/5 Very Good (1,204 reviews)",
      price: 132, priceWithTaxesLabel: "$143 w taxes and fees", outOfPolicy: false,
      optionalData: { badges: ["company-preferred"], sustainabilityCert: false, coworkerPct: null, perkStrip: null, colleagueReviews: null, paymentCvvNote: false }
    },
    {
      id: "home2-suites-seattle-airport", name: "Home2 Suites by Hilton Seattle Airport", stars: 3,
      distanceMiles: 11.2, distanceLabel: "11.2 miles away",
      reviewsScoreValue: 3.9, reviewsScoreLabel: "3.9/5 Very Good (876 reviews)",
      price: 119, priceWithTaxesLabel: "$129 w taxes and fees", outOfPolicy: true,
      optionalData: { badges: ["company-preferred"], sustainabilityCert: false, coworkerPct: null, perkStrip: null, colleagueReviews: null, paymentCvvNote: false }
    }
  ]
};
