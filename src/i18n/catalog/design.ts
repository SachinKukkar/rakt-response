import type { Catalog } from "./types";

/** English UI text → Hindi for the 2026 redesign (homepage, header, footer, contacts). */
const hi: Catalog = {
  // --- Homepage: numbered section labels ---------------------------------------------
  "The donation": "डोनेशन",
  "Who we are": "हम कौन हैं",
  "Two ways to help": "मदद के दो तरीके",
  Questions: "सवाल",
  "Talk to us": "हमसे बात करें",
  min: "मिनट",

  // --- Homepage: hero ---------------------------------------------------------------
  "Every donor matters.": "हर डोनर मायने रखता है।",
  "Every response can save a life.": "हर जवाब एक जान बचा सकता है।",
  "Free, private and checked by volunteers.": "मुफ़्त, निजी, और वॉलंटियर द्वारा जाँचा गया।",
  "How it works in four steps": "चार कदमों में पूरी प्रक्रिया",
  "Volunteer checks": "वॉलंटियर जाँचते हैं",
  "You say yes": "आप हाँ कहते हैं",
  "Donate, log it": "डोनेट करें, दर्ज करें",
  "In the chair": "कुर्सी पर",
  "Sterile kit": "स्टेराइल किट",
  "On the machine": "मशीन पर",
  "Extra checks": "ज़्यादा जाँच",
  "Platelets only": "सिर्फ़ प्लेटलेट्स",

  // --- Homepage: facts ----------------------------------------------------------------
  "Facts about donating": "डोनेशन से जुड़ी बातें",
  "Including the rare Bombay (Oh) group.": "दुर्लभ बॉम्बे (Oh) ग्रुप समेत।",
  "To use Rakt Response": "Rakt Response इस्तेमाल करने का खर्च",
  "Free for donors, families and volunteers.": "डोनर, परिवार और वॉलंटियर, सबके लिए मुफ़्त।",
  "Minutes in the chair": "डोनेशन में लगने वाले मिनट",
  "For a whole blood donation.": "होल ब्लड डोनेशन के लिए।",
  "Parts from one donation": "एक डोनेशन के हिस्से",
  "Red cells, plasma and platelets.": "रेड सेल्स, प्लाज़्मा और प्लेटलेट्स।",

  // --- Homepage: (01) the donation ---------------------------------------------------
  "One visit, about an hour,": "एक बार जाना, लगभग एक घंटा,",
  "Eat a light meal, drink water and carry a photo ID. Most of the visit is checks and rest; the donation itself takes about 10–15 minutes.":
    "हल्का खाना खाएँ, पानी पिएँ और फ़ोटो वाला पहचान पत्र साथ रखें। ज़्यादातर समय जाँच और आराम में जाता है; डोनेशन खुद लगभग 10–15 मिनट का होता है।",
  "A typical whole blood visit": "होल ब्लड डोनेशन की आम विज़िट",
  "Register and show your ID": "रजिस्टर करें और पहचान पत्र दिखाएँ",
  "Confidential health questionnaire": "सेहत से जुड़े गोपनीय सवाल",
  "Mini check: haemoglobin, pulse, blood pressure": "छोटी जाँच: हीमोग्लोबिन, नब्ज़, ब्लड प्रेशर",
  "The donation, in the chair": "कुर्सी पर डोनेशन",
  "Rest, a drink and a snack": "आराम, कुछ पीना और नाश्ता",
  "5 min": "5 मिनट",
  "10 min": "10 मिनट",
  "10–15 min": "10–15 मिनट",
  "15 min": "15 मिनट",
  "You leave in about an hour": "लगभग एक घंटे में आप वापस जा सकते हैं",
  "Then log it in your profile": "फिर इसे अपनी प्रोफ़ाइल में दर्ज करें",
  "Times are typical and vary by centre.": "समय अंदाज़न है और हर सेंटर में अलग हो सकता है।",

  // --- Homepage: (02) how it works ---------------------------------------------------
  "Four parts.": "चार हिस्से।",
  "One response.": "एक जवाब।",
  "How we work": "हम कैसे काम करते हैं",
  "Register in 2 minutes": "2 मिनट में रजिस्टर करें",
  "Blood group and broad area": "ब्लड ग्रुप और आपका इलाका",
  "Contact only with your consent": "संपर्क सिर्फ़ आपकी मर्ज़ी से",
  "You choose who can find you": "कौन आपको ढूँढ सकता है, यह आप तय करें",
  "Pause any time": "कभी भी रोक सकते हैं",
  "Verified first": "पहले जाँच",
  "Checked with the hospital or requester": "अस्पताल या रिक्वेस्ट करने वाले से पुष्टि",
  "Shared only once verified": "जाँच के बाद ही शेयर",
  "Listed publicly only with permission": "अनुमति हो तभी सबको दिखती है",
  "Duplicates caught": "दोहराई गई रिक्वेस्ट पकड़ी जाती हैं",
  "Authorised only": "सिर्फ़ अधिकृत लोग",
  "Approved coordinators": "मंज़ूर किए गए कोऑर्डिनेटर",
  "Every number they open is logged": "हर नंबर देखने का रिकॉर्ड रहता है",
  "They call only donors who said yes": "सिर्फ़ उन्हीं डोनरों को फ़ोन जिन्होंने हाँ कहा",
  "They follow up after the donation": "डोनेशन के बाद हालचाल पूछते हैं",
  "Your record": "आपका रिकॉर्ड",
  "Whole blood and SDP history": "होल ब्लड और SDP का इतिहास",
  "Self-reported until verified": "जाँच होने तक 'खुद बताया गया'",
  "Track the gap between donations": "दो डोनेशन के बीच का अंतर देखें",
  "Share a summary only if you want": "चाहें तो ही सारांश दिखाएँ",

  // --- Homepage: (03) can I donate? --------------------------------------------------
  "Pick a check.": "एक जाँच चुनें।",
  "See where you sit.": "देखें आप कहाँ हैं।",
  "Blood centres look at a few simple things before every donation. Here are the usual ranges in India, the same ones on our eligibility page.":
    "हर डोनेशन से पहले ब्लड सेंटर कुछ आसान बातें देखते हैं। ये भारत में आम तौर पर मानी जाने वाली सीमाएँ हैं, वही जो हमारे योग्यता वाले पेज पर हैं।",
  "Eligibility checks": "योग्यता की जाँच",
  "Usual ranges in India": "भारत में आम सीमाएँ",
  "Since last donation": "पिछले डोनेशन से",
  years: "साल",
  kg: "किलो",
  days: "दिन",
  "Under 18": "18 से कम",
  "Usual 18–65": "आम तौर पर 18–65",
  "Over 65": "65 से ज़्यादा",
  "Usually too young to donate": "आम तौर पर डोनेट करने के लिए उम्र कम है",
  "Within the usual range": "आम सीमा के अंदर",
  "Ask the blood centre": "ब्लड सेंटर से पूछें",
  "Under 45": "45 से कम",
  "45–50 depends": "45–50: सेंटर पर निर्भर",
  "50 kg+": "50 किलो+",
  "Usually below the minimum": "आम तौर पर न्यूनतम से कम",
  "Depends on the centre and bag size": "सेंटर और बैग के साइज़ पर निर्भर",
  "Usually enough for whole blood": "आम तौर पर होल ब्लड के लिए काफ़ी",
  "Under 90": "90 से कम",
  "90+ men": "90+ पुरुष",
  "120+ women": "120+ महिलाएँ",
  "Usually too soon for whole blood": "आम तौर पर होल ब्लड के लिए बहुत जल्दी",
  "Usually long enough for men; women usually wait 120 days": "पुरुषों के लिए आम तौर पर काफ़ी; महिलाएँ आम तौर पर 120 दिन रुकती हैं",
  "Usually long enough for whole blood": "आम तौर पर होल ब्लड के लिए काफ़ी समय",
  "Move the slider to match you": "स्लाइडर को अपने हिसाब से खिसकाएँ",
  "The blood centre's doctor decides, every time.": "हर बार फ़ैसला ब्लड सेंटर का डॉक्टर करता है।",
  "Full eligibility guide": "योग्यता की पूरी जानकारी",

  // --- Homepage: (04) blood groups ---------------------------------------------------
  "Nine blood groups.": "नौ ब्लड ग्रुप।",
  "One community.": "एक परिवार।",
  "Register yours once. Volunteers reach the right donors faster, and your number stays private.":
    "अपना ग्रुप एक बार दर्ज करें। वॉलंटियर सही डोनर तक जल्दी पहुँचते हैं, और आपका नंबर निजी रहता है।",
  "Blood groups, including the rare Bombay group": "ब्लड ग्रुप, दुर्लभ बॉम्बे ग्रुप समेत",
  Rare: "दुर्लभ",
  "Rare, and easily mistaken for O in routine tests. People with Oh can receive only Oh blood, so every Oh donor counts.":
    "दुर्लभ है, और आम जाँच में इसे O समझ लिया जाता है। Oh वाले लोगों को सिर्फ़ Oh खून ही चढ़ाया जा सकता है, इसलिए हर Oh डोनर बहुत मायने रखता है।",
  "Requests matched to the exact group": "रिक्वेस्ट ठीक उसी ग्रुप से मिलाई जाती है",
  "Hospitals cross-match before every transfusion": "हर बार खून चढ़ाने से पहले अस्पताल क्रॉस-मैच करते हैं",
  "Bombay blood group (rare)": "बॉम्बे ब्लड ग्रुप (दुर्लभ)",
  "Oh (Bombay)": "Oh (बॉम्बे)",
  "What is the Bombay (Oh) blood group?": "बॉम्बे (Oh) ब्लड ग्रुप क्या है?",
  "A rare blood group, first identified in Bombay (now Mumbai). Routine tests can mistake it for O, and people with it can receive only Oh blood. If you know your group is Oh, please register: you may be one of very few donors who can help.":
    "एक दुर्लभ ब्लड ग्रुप, जो सबसे पहले बॉम्बे (अब मुंबई) में पहचाना गया। आम जाँच में इसे O समझ लिया जाता है, और इस ग्रुप वाले लोगों को सिर्फ़ Oh खून ही चढ़ाया जा सकता है। अगर आपका ग्रुप Oh है, तो कृपया रजिस्टर करें: आप उन गिने-चुने डोनरों में हो सकते हैं जो मदद कर सकते हैं।",

  // --- Homepage: (05) who we are -----------------------------------------------------
  "No family should have to make fifty calls at night to find a donor. So we built a calmer way: requests checked by volunteers, and donors who already said yes.":
    "किसी भी परिवार को रात में डोनर ढूँढने के लिए पचास फ़ोन नहीं करने चाहिए। इसलिए हमने एक आसान रास्ता बनाया: वॉलंटियर जिन रिक्वेस्ट की जाँच करते हैं, और ऐसे डोनर जो पहले से हाँ कह चुके हैं।",
  "Rakt Response Team": "Rakt Response टीम",
  "Volunteers · India · Since 2026": "वॉलंटियर · भारत · 2026 से",
  "The team": "टीम",
  "Core team · Volunteer": "मुख्य टीम · वॉलंटियर",

  // --- Homepage: (06) two ways to help -----------------------------------------------
  "Give blood.": "खून दें।",
  "Or ask for it.": "या माँगें।",
  "For anyone aged 18–65 who wants to help.": "18–65 साल का कोई भी, जो मदद करना चाहे।",
  Free: "मुफ़्त",
  Always: "हमेशा",
  "For patients' families and hospitals.": "मरीज़ों के परिवार और अस्पतालों के लिए।",
  "Register in about two minutes": "लगभग दो मिनट में रजिस्टर करें",
  "Your number is never public": "आपका नंबर कभी सबके सामने नहीं आता",
  "Only verified requests, near you": "सिर्फ़ जाँची हुई रिक्वेस्ट, आपके पास की",
  "Say no any time": "कभी भी मना कर सकते हैं",
  "Keep a record of every donation": "हर डोनेशन का रिकॉर्ड रखें",
  "Submit a request in minutes": "कुछ ही मिनट में रिक्वेस्ट भेजें",
  "A volunteer checks it with the hospital": "वॉलंटियर अस्पताल से इसकी पुष्टि करता है",
  "Matching donors are contacted with their consent": "मेल खाने वाले डोनरों से उनकी मर्ज़ी से संपर्क होता है",
  "Updates as volunteers coordinate": "वॉलंटियर जैसे-जैसे काम करते हैं, आपको जानकारी मिलती है",
  Sample: "नमूना",
  "These are sample quotes. Real ones will replace them as people share their experiences.":
    "ये नमूने के तौर पर लिखी बातें हैं। लोग अपने अनुभव शेयर करेंगे, तो असली बातें इनकी जगह ले लेंगी।",
  "Live from our records": "हमारे रिकॉर्ड से, अभी के आँकड़े",
  "Counted live from verified records. Never estimated.": "जाँचे गए रिकॉर्ड से अभी गिने गए। कभी अंदाज़ा नहीं।",

  // --- Homepage: (07) stories, (08) questions, (09) talk to us ------------------------
  "Stories from our community.": "हमारे लोगों की कहानियाँ।",
  "In their own words.": "उन्हीं की ज़ुबानी।",
  "Sample stories, shown until real ones are published.": "ये नमूना कहानियाँ हैं, जो असली कहानियाँ छपने तक दिखाई जा रही हैं।",
  "Read sample story: {title}": "नमूना कहानी पढ़ें: {title}",
  "Sample story": "नमूना कहानी",
  "This is a sample story, written to show how stories will look here. It does not describe a real person or event.":
    "यह एक नमूना कहानी है, जो यह दिखाने के लिए लिखी गई है कि यहाँ कहानियाँ कैसी दिखेंगी। यह किसी असली इंसान या घटना के बारे में नहीं है।",
  "Have a story of your own?": "आपकी भी कोई कहानी है?",
  "Real stories replace these samples once contributors share them with consent.":
    "लोग अपनी मर्ज़ी से कहानियाँ शेयर करेंगे, तो असली कहानियाँ इन नमूनों की जगह ले लेंगी।",
  "Asked before every first donation.": "पहले डोनेशन से पहले अक्सर पूछे जाने वाले सवाल।",
  "Anything else? Ask us. A volunteer replies, usually within a day.": "कुछ और पूछना है? हमसे पूछें। आम तौर पर एक दिन में वॉलंटियर जवाब देते हैं।",
  "Ask a question": "सवाल पूछें",
  "Talk to a person.": "किसी इंसान से बात करें।",
  "Not a form.": "फ़ॉर्म से नहीं।",
  "Call or message the team. For anything urgent, call the hospital first.": "टीम को फ़ोन या मैसेज करें। कुछ भी अर्जेंट हो, तो पहले अस्पताल को फ़ोन करें।",
  "In an emergency call 112, or go to the nearest hospital": "इमरजेंसी में 112 पर फ़ोन करें, या पास के अस्पताल जाएँ",

  // --- Contacts -----------------------------------------------------------------------
  "Call the team": "टीम को फ़ोन करें",
  Call: "फ़ोन करें",
  "Call {name}": "{name} को फ़ोन करें",
  "WhatsApp {name}": "{name} को WhatsApp करें",
  "All contact options": "संपर्क के सभी तरीके",

  // --- Header, menu, footer, logo -----------------------------------------------------
  Close: "बंद करें",
  "All pages of Rakt Response": "Rakt Response के सभी पेज",
  "Every donor matters. Every response can save a life.": "हर डोनर मायने रखता है। हर जवाब एक जान बचा सकता है।",
  "© {year} Rakt Response Team": "© {year} Rakt Response टीम",
  India: "भारत",
  "Not an emergency service. In an emergency call 112.": "यह इमरजेंसी सेवा नहीं है। इमरजेंसी में 112 पर फ़ोन करें।",
  "Photos: {credits}": "फ़ोटो: {credits}",
  "Rakt Response logo": "Rakt Response का लोगो",
  "Rakt Response, since 2026": "Rakt Response, 2026 से",
  "SDP.": "SDP।",

  // --- Photo descriptions (alt text) --------------------------------------------------
  "A health worker in gloves preparing a donor's arm for a blood donation": "दस्ताने पहने एक स्वास्थ्यकर्मी, ब्लड डोनेशन के लिए डोनर का हाथ तैयार करते हुए",
  "A bag of donated blood hanging from a stand": "स्टैंड पर टंगा दान किए गए खून का बैग",
  "Red blood cells, magnified": "बड़ी करके दिखाई गईं लाल रक्त कोशिकाएँ",
  "A donor's arm during a donation, the hand squeezing a soft ball": "डोनेशन के दौरान डोनर का हाथ, नरम गेंद दबाते हुए",
  "A gloved hand resting reassuringly on a patient's arm": "मरीज़ के हाथ पर तसल्ली देता दस्ताने वाला हाथ",
  "Many hands painted red, held together to form a heart": "लाल रंग से रंगे कई हाथ, मिलकर दिल का आकार बनाते हुए",
};

export default hi;
