import type { Catalog } from "./types";

/** English UI text → Hindi. Keep the English key exactly as written in the code. */
const hi: Catalog = {
  // --- Find blood (src/app/(site)/blood-requests/page.tsx) ---------------------
  "Submit a blood request for Rakt Mitras to coordinate and see verified requests where voluntary donors can help.":
    "खून की रिक्वेस्ट भेजें, ताकि रक्त मित्र मदद कर सकें। साथ ही वे जाँची गई रिक्वेस्ट देखें जिनमें स्वैच्छिक डोनर मदद कर सकते हैं।",
  "Need blood?": "खून चाहिए?",
  "We'll rally donors.": "हम डोनर जुटाएँगे।",
  "Tell us what's needed. A Rakt Mitra checks it with the hospital, then you see donors who can give now and contact them.":
    "बताइए क्या चाहिए। रक्त मित्र अस्पताल से इसकी जाँच करता है, फिर आप अभी रक्तदान कर सकने वाले डोनर देखते हैं और उनसे संपर्क करते हैं।",
  "Verified before sharing": "शेयर से पहले जाँच",
  "Free, always": "हमेशा मुफ़्त",
  "Donors who can give now": "अभी रक्तदान कर सकने वाले डोनर",
  "Submit a request": "रिक्वेस्ट भेजें",
  "Emergency? Call the hospital first": "इमरजेंसी है? पहले अस्पताल को फ़ोन करें",
  "The treating hospital or nearest licensed blood bank comes first. We coordinate voluntary donors — we can't reserve blood, check compatibility or guarantee a donor.":
    "सबसे पहले इलाज करने वाले अस्पताल या नज़दीकी लाइसेंस वाले ब्लड बैंक से बात करें। हम स्वैच्छिक डोनर से तालमेल करते हैं — हम खून रिज़र्व नहीं कर सकते, ब्लड मैच की जाँच नहीं कर सकते और डोनर मिलने की गारंटी नहीं दे सकते।",
  "Can you help?": "क्या आप मदद कर सकते हैं?",
  "Verified requests": "जाँची गई रिक्वेस्ट",
  "Checked with the hospital by a Rakt Mitra. Tap one to help.":
    "रक्त मित्र ने अस्पताल से इनकी जाँच की है। मदद के लिए किसी एक पर टैप करें।",
  "Filter requests": "रिक्वेस्ट छाँटें",
  "Blood group": "ब्लड ग्रुप",
  "All groups": "सभी ग्रुप",
  "Donor type": "डोनर का प्रकार",
  "All types": "सभी प्रकार",
  District: "ज़िला",
  "e.g. Pune": "जैसे पुणे",
  Apply: "लागू करें",
  Reset: "रीसेट करें",
  "Requests are unavailable right now": "अभी रिक्वेस्ट नहीं दिख रहीं",
  "We couldn't load verified requests. Please try again shortly.": "जाँची गई रिक्वेस्ट लोड नहीं हो पाईं। कृपया थोड़ी देर बाद फिर कोशिश करें।",
  "No verified requests match these filters": "इन फ़िल्टर से कोई जाँची गई रिक्वेस्ट नहीं मिली",
  "No open verified requests right now": "अभी कोई खुली जाँची गई रिक्वेस्ट नहीं है",
  "That's good news. Register as a donor so we can reach you when a request matches your blood group.":
    "यह अच्छी खबर है। डोनर के रूप में रजिस्टर करें, ताकि आपके ब्लड ग्रुप की रिक्वेस्ट आने पर हम आपसे संपर्क कर सकें।",

  // --- One request (src/app/(site)/blood-requests/[id]/page.tsx) -----------------
  "Blood request": "खून की रिक्वेस्ट",
  "All requests": "सभी रिक्वेस्ट",
  "{group} donors needed": "{group} डोनर चाहिए",
  "Request {code}": "रिक्वेस्ट {code}",
  "Verified by a Rakt Mitra on {date}.": "Rakt Response के रक्त मित्र ने {date} को इसकी जाँच की।",
  "Registered donors can let Rakt Mitras know they're available. A Rakt Mitra will contact you with next steps — please don't go to the hospital until they confirm, and the blood centre will check your eligibility.":
    "रजिस्टर्ड डोनर रक्त मित्रों को बता सकते हैं कि वे उपलब्ध हैं। एक रक्त मित्र आपसे संपर्क करके आगे का तरीका बताएगा — जब तक वे पुष्टि न करें, कृपया अस्पताल न जाएँ। आप रक्तदान कर सकते हैं या नहीं, यह ब्लड बैंक जाँचेगा।",
  "I can help — sign in to respond": "मैं मदद कर सकता/सकती हूँ — जवाब देने के लिए साइन इन करें",
  "Register as a donor": "डोनर के रूप में रजिस्टर करें",
  "This request is no longer open": "यह रिक्वेस्ट अब खुली नहीं है",
  "Thank you to everyone who responded.": "जवाब देने वाले सभी लोगों का धन्यवाद।",
  "Rakt Response facilitates coordination only. It does not reserve blood, certify compatibility or replace the hospital or a licensed blood bank.":
    "Rakt Response सिर्फ़ तालमेल में मदद करता है। यह खून रिज़र्व नहीं करता, ब्लड मैच की पुष्टि नहीं करता और अस्पताल या लाइसेंस वाले ब्लड बैंक की जगह नहीं लेता।",

  // --- Request card (src/components/requests/request-card.tsx) ----------------------
  "{count} unit": "{count} यूनिट",
  "{count} units": "{count} यूनिट",
  "Needed by {date}": "{date} तक चाहिए",
  "Ref. {code}": "रेफ़रेंस: {code}",
  "Request {code}: {group} at {hospital}": "रिक्वेस्ट {code}: {hospital} में {group}",

  // --- New request (src/app/(site)/blood-requests/new/page.tsx) -----------------
  "Submit a blood request": "खून की रिक्वेस्ट भेजें",
  "Ask Rakt Mitras to help find voluntary donors for a hospital requirement.":
    "अस्पताल की ज़रूरत के लिए स्वैच्छिक डोनर ढूँढने में Rakt Response के रक्त मित्रों से मदद माँगें।",
  Request: "रिक्वेस्ट",
  "About two minutes. A Rakt Mitra verifies every request before any donor is contacted.":
    "बस दो मिनट लगेंगे। किसी भी डोनर से संपर्क करने से पहले रक्त मित्र हर रिक्वेस्ट की जाँच करता है।",
  "First, contact the hospital blood bank": "पहले अस्पताल के ब्लड बैंक से बात करें",
  "They know exactly what is needed and may already have units. Use this form for help finding voluntary donors.":
    "उन्हें ठीक-ठीक पता होता है कि क्या चाहिए, और हो सकता है उनके पास खून पहले से हो। स्वैच्छिक डोनर ढूँढने में मदद के लिए यह फ़ॉर्म भरें।",
  "Please sign in to submit a request": "रिक्वेस्ट भेजने के लिए कृपया साइन इन करें",
  "Requests from signed-in members help us prevent spam and keep you updated.":
    "साइन इन करके रिक्वेस्ट भेजने से हम स्पैम रोक पाते हैं और आपको जानकारी देते रहते हैं।",
  "Requests are not available in this environment because the database is not configured.":
    "यहाँ अभी रिक्वेस्ट नहीं भेजी जा सकतीं, क्योंकि डेटाबेस सेट नहीं है।",
  "Create a free account": "मुफ़्त खाता बनाएँ",

  // --- Request form (src/components/requests/request-form.tsx) ----------------------
  "Request received": "रिक्वेस्ट मिल गई",
  "Your reference is": "आपका रेफ़रेंस नंबर:",
  "Please note it down.": "कृपया इसे लिख लें।",
  "A similar request is already open": "ऐसी ही एक रिक्वेस्ट पहले से खुली है",
  "It looks like a request for the same blood group at this hospital was submitted recently. Rakt Mitras will check both so donors aren't contacted twice.":
    "लगता है इसी अस्पताल के लिए इसी ब्लड ग्रुप की रिक्वेस्ट हाल ही में भेजी गई है। रक्त मित्र दोनों को देखेंगे, ताकि डोनर से दो बार संपर्क न हो।",
  "A Rakt Mitra will verify the request with you or the hospital before contacting donors.":
    "डोनर से संपर्क करने से पहले रक्त मित्र आपसे या अस्पताल से रिक्वेस्ट की पुष्टि करेगा।",
  "Until it is verified it is not shown publicly or sent to donors.": "पुष्टि होने तक यह रिक्वेस्ट न सबको दिखाई जाती है, न डोनर को भेजी जाती है।",
  "Keep in touch with the hospital blood bank — they decide what is needed and when.":
    "अस्पताल के ब्लड बैंक से संपर्क में रहें — क्या और कब चाहिए, यह वही तय करते हैं।",
  "Track in My requests": "मेरी रिक्वेस्ट में देखें",
  "Back to blood requests": "खून की रिक्वेस्ट पर वापस जाएँ",
  "What is needed": "क्या चाहिए",
  "Type of donor needed": "किस तरह का डोनर चाहिए",
  "Standard blood donation (the hospital may separate components).": "आम रक्तदान (अस्पताल खून के हिस्से अलग कर सकता है)।",
  "Single donor platelets collected by apheresis at the hospital's platelet unit.":
    "एक ही डोनर से प्लेटलेट्स, जो अस्पताल की प्लेटलेट यूनिट में एफ़ेरेसिस से लिए जाते हैं।",
  "Another specific apheresis component, as advised by the hospital.": "अस्पताल की सलाह के अनुसार कोई दूसरा एफ़ेरेसिस हिस्सा।",
  "SDP donors need additional screening at the apheresis centre (for example a platelet count). The hospital decides suitability and timing — we only help find willing donors.":
    "SDP डोनर की एफ़ेरेसिस सेंटर पर अलग से जाँच होती है (जैसे प्लेटलेट काउंट)। डोनर सही है या नहीं, और कब देना है, यह अस्पताल तय करता है — हम सिर्फ़ तैयार डोनर ढूँढने में मदद करते हैं।",
  "Units / donors needed (if known)": "कितनी यूनिट / कितने डोनर चाहिए (अगर पता हो)",
  Urgency: "कितनी जल्दी",
  "Needed by (date and time)": "कब तक चाहिए (तारीख और समय)",
  "India time.": "भारत का समय।",
  Where: "कहाँ",
  "Hospital or blood bank": "अस्पताल या ब्लड बैंक",
  City: "शहर",
  State: "राज्य",
  "Select…": "चुनें…",
  "How Rakt Mitras can reach you": "रक्त मित्र आपसे कैसे संपर्क करें",
  "Kept private — only authorised Rakt Mitras see these details.": "यह जानकारी प्राइवेट रहती है — इसे सिर्फ़ अधिकृत रक्त मित्र देखते हैं।",
  "Your name": "आपका नाम",
  Phone: "फ़ोन",
  "Best way to reach you": "आपसे संपर्क का सबसे अच्छा तरीका",
  "Anything Rakt Mitras should know? (optional)": "रक्त मित्रों को कुछ और बताना है? (ज़रूरी नहीं)",
  "Please don't include the patient's name, diagnosis or medical documents.": "कृपया मरीज़ का नाम, बीमारी या मेडिकल कागज़ न लिखें।",
  "List this request publicly once it is verified": "पुष्टि होने के बाद यह रिक्वेस्ट सबको दिखाएँ",
  "Only the blood group, donor type, hospital, city, time needed and urgency are shown — never your name or contact details.":
    "सिर्फ़ ब्लड ग्रुप, डोनर का प्रकार, अस्पताल, शहर, कब तक चाहिए और कितनी जल्दी — यही दिखाया जाता है। आपका नाम या संपर्क जानकारी कभी नहीं।",
  "I understand Rakt Response helps find voluntary donors but cannot guarantee availability, reserve blood or decide compatibility":
    "मैं समझता/समझती हूँ कि Rakt Response स्वैच्छिक डोनर ढूँढने में मदद करता है, पर डोनर मिलने की गारंटी नहीं दे सकता, खून रिज़र्व नहीं कर सकता और ब्लड मैच तय नहीं कर सकता",
  "I will stay in contact with the hospital or licensed blood bank.": "मैं अस्पताल या लाइसेंस वाले ब्लड बैंक से संपर्क में रहूँगा/रहूँगी।",
  "Submitting…": "भेजा जा रहा है…",
  "Submit request for verification": "जाँच के लिए रिक्वेस्ट भेजें",

  // --- My requests (src/app/(member)/requests/page.tsx) ------------------------
  "Requests where your help could matter, and requests you've submitted.":
    "वे रिक्वेस्ट जिनमें आपकी मदद काम आ सकती है, और वे रिक्वेस्ट जो आपने भेजी हैं।",
  "New request": "नई रिक्वेस्ट",
  "Contact requests waiting for you": "आपके जवाब का इंतज़ार करती संपर्क रिक्वेस्ट",
  "A Rakt Mitra asked if they may contact you. Your details are shared only if you accept.":
    "एक रक्त मित्र पूछ रहे हैं कि क्या वे आपसे संपर्क कर सकते हैं। आप हाँ कहेंगे, तभी आपकी जानकारी शेयर होगी।",
  "Respond by {date}": "{date} तक जवाब दें",
  "Share my contact details": "मेरी संपर्क जानकारी शेयर करें",
  Decline: "मना करें",
  "Requests that match you": "आपसे मेल खाती रिक्वेस्ट",
  "Respond only if you can currently donate. A Rakt Mitra will confirm before you travel.":
    "जवाब तभी दें जब आप अभी रक्तदान कर सकते हों। आपके निकलने से पहले रक्त मित्र पुष्टि करेगा।",
  "Interest is not a commitment, and it is never treated as a confirmed donation. The blood centre will check your eligibility.":
    "'तैयार हूँ' कहना कोई वादा नहीं है, और इसे कभी पक्का रक्तदान नहीं माना जाता। आप रक्तदान कर सकते हैं या नहीं, यह ब्लड बैंक जाँचेगा।",
  "Your response: {response}": "आपका जवाब: {response}",
  "You shared contact details": "आपने संपर्क जानकारी शेयर की",
  "I can help": "मैं मदद कर सकता/सकती हूँ",
  "Not available": "अभी उपलब्ध नहीं",
  "Nothing needs you right now": "अभी आपके लिए कोई रिक्वेस्ट नहीं है",
  "Verified requests for your blood group in your district will appear here.": "आपके ज़िले में आपके ब्लड ग्रुप की जाँची गई रिक्वेस्ट यहाँ दिखेंगी।",
  "Want to respond to requests?": "रिक्वेस्ट का जवाब देना चाहते हैं?",
  "Add your blood group and area": "अपना ब्लड ग्रुप और इलाका जोड़ें",
  "to join the donor register.": "और डोनर सूची में शामिल हों।",
  "Requests you submitted": "आपकी भेजी हुई रिक्वेस्ट",
  "Note: {reason}": "नोट: {reason}",
  "No longer needed": "अब ज़रूरत नहीं",
  "Cancel — no longer needed": "रद्द करें — अब ज़रूरत नहीं",
  "Cancel this request? Rakt Mitras will stop contacting donors.": "यह रिक्वेस्ट रद्द करें? रक्त मित्र डोनर से संपर्क करना बंद कर देंगे।",
  "You haven't submitted any requests": "आपने अभी कोई रिक्वेस्ट नहीं भेजी है",
  "If someone needs blood, submit a request and a Rakt Mitra will verify it.": "अगर किसी को खून चाहिए, तो रिक्वेस्ट भेजें। रक्त मित्र उसकी जाँच करेगा।",

  // --- Patients and donors (18 October 2026) -----------------------------------------
  "Patient":
    "मरीज़",
  "Patient's full name":
    "मरीज़ का पूरा नाम",
  "As on the hospital's blood request form.":
    "जैसा अस्पताल के ब्लड रिक्वेस्ट फ़ॉर्म पर लिखा है।",
  "Age (years)":
    "उम्र (साल)",
  "Gender":
    "लिंग",
  "Female":
    "महिला",
  "Male":
    "पुरुष",
  "Other":
    "अन्य",
  "Units / donors needed":
    "कितनी यूनिट / कितने डोनर चाहिए",
  "Choose":
    "चुनें",
  "Hospital":
    "अस्पताल",
  "Patient's IP / UHID number (optional)":
    "मरीज़ का IP / UHID नंबर (अगर हो)",
  "Donors give this at the blood bank.":
    "डोनर ब्लड बैंक में यह नंबर बताते हैं।",
  "Ward or bed (optional)":
    "वार्ड या बेड (अगर हो)",
  "Your details":
    "आपकी जानकारी",
  "Rakt Mitras see all these details to verify the request. Donors who offer to help see the patient's name, the hospital, and your name and number, so they can reach you.":
    "रक्त मित्र रिक्वेस्ट की जाँच के लिए यह सारी जानकारी देखते हैं। मदद के लिए आगे आने वाले डोनर मरीज़ का नाम, अस्पताल, और आपका नाम व नंबर देखते हैं, ताकि वे आप तक पहुँच सकें।",
  "Your relation to the patient":
    "मरीज़ से आपका रिश्ता",
  "Your phone":
    "आपका फ़ोन",
  "Donors can reach you by":
    "डोनर आप तक ऐसे पहुँचें",
  "A Rakt Mitra will check the request with the hospital.":
    "रक्त मित्र अस्पताल से रिक्वेस्ट की जाँच करेगा।",
  "Once it is verified, your request page shows donors who can give now, and you can contact them directly.":
    "जाँच के बाद आपकी रिक्वेस्ट वाले पेज पर वे डोनर दिखेंगे जो अभी रक्तदान कर सकते हैं, और आप उनसे सीधे संपर्क कर सकेंगे।",
  "Open my request":
    "मेरी रिक्वेस्ट खोलें",
  "I am the patient":
    "मैं ही मरीज़ हूँ",
  "Parent":
    "माता या पिता",
  "Son or daughter":
    "बेटा या बेटी",
  "Husband or wife":
    "पति या पत्नी",
  "Brother or sister":
    "भाई या बहन",
  "Other relative":
    "दूसरे रिश्तेदार",
  "Friend":
    "दोस्त",
  "Accident":
    "दुर्घटना",
  "Thalassemia":
    "थैलेसीमिया",
  "Delivery":
    "प्रसव (डिलीवरी)",
  "Dengue":
    "डेंगू",
  "Anaemia":
    "एनीमिया (खून की कमी)",
  "You joined this request":
    "आप इस रिक्वेस्ट से जुड़ चुके हैं",
  "Add your blood group to join requests":
    "रिक्वेस्ट से जुड़ने के लिए अपना ब्लड ग्रुप जोड़ें",
  "Needs a different blood group":
    "दूसरा ब्लड ग्रुप चाहिए",
  "Too soon after your last donation":
    "पिछले रक्तदान को अभी ज़्यादा समय नहीं हुआ",
  "WhatsApp {phone}":
    "WhatsApp {phone}",
  "Email {email}":
    "ईमेल {email}",
  "Ready to donate":
    "रक्तदान के लिए तैयार",
  "Can give now":
    "अभी दे सकते हैं",
  "Prefers: {method}":
    "पसंद: {method}",
  "This donor keeps their number hidden. They have your request and will reach you, or a Rakt Mitra will connect you.":
    "इस डोनर ने अपना नंबर छिपा रखा है। आपकी रिक्वेस्ट उनके पास है, वे आप तक पहुँचेंगे, या कोई रक्त मित्र आपको जोड़ देगा।",
  "Show contact":
    "संपर्क दिखाएँ",
  "Your request for {group} blood at {hospital}.":
    "{hospital} में {group} खून के लिए आपकी रिक्वेस्ट।",
  "All my requests":
    "मेरी सारी रिक्वेस्ट",
  "Same blood group, near you, and enough time since their last donation. Tap Show contact to reach a donor on the channel they chose.":
    "एक ही ब्लड ग्रुप, आपके पास, और पिछले रक्तदान को काफ़ी समय हो चुका। डोनर से उनके चुने तरीके से संपर्क के लिए “संपर्क दिखाएँ” दबाएँ।",
  "Please use these numbers only for this request and don't share them. The blood centre's doctor still checks every donor.":
    "ये नंबर सिर्फ़ इसी रिक्वेस्ट के लिए इस्तेमाल करें और किसी से शेयर न करें। ब्लड सेंटर का डॉक्टर फिर भी हर डोनर की जाँच करता है।",
  "Ready to donate ({count})":
    "रक्तदान के लिए तैयार ({count})",
  "More donors who can give now ({count})":
    "अभी दे सकने वाले और डोनर ({count})",
  "No donor can give right now in your district":
    "आपके ज़िले में अभी कोई डोनर रक्तदान नहीं कर सकता",
  "Rakt Mitras are looking too. We'll notify you when a donor joins your request.":
    "रक्त मित्र भी ढूँढ रहे हैं। कोई डोनर आपकी रिक्वेस्ट से जुड़ेगा तो हम आपको बताएँगे।",
  "A Rakt Mitra is checking your request":
    "रक्त मित्र आपकी रिक्वेस्ट जाँच रहा है",
  "They check it with the hospital. Once it is verified, donors who can give now appear here, and you can contact them directly.":
    "वे अस्पताल से इसकी जाँच करते हैं। जाँच के बाद अभी रक्तदान कर सकने वाले डोनर यहाँ दिखेंगे, और आप उनसे सीधे संपर्क कर सकेंगे।",
  "Details you gave":
    "आपकी दी हुई जानकारी",
  "{age} years":
    "{age} साल",
  "IP / UHID":
    "IP / UHID",
  "Ward or bed":
    "वार्ड या बेड",
  "When needed":
    "कब तक चाहिए",
  "Your relation":
    "आपका रिश्ता",
  "Need to change something? Contact a Rakt Mitra.":
    "कुछ बदलना है? किसी रक्त मित्र से संपर्क करें।",
  "Cancel this request? Donors and Rakt Mitras will stop contacting you.":
    "यह रिक्वेस्ट रद्द करें? डोनर और रक्त मित्र आपसे संपर्क करना बंद कर देंगे।",
  "You joined this request. Thank you.":
    "आप इस रिक्वेस्ट से जुड़े हैं। धन्यवाद।",
  "Patient and hospital":
    "मरीज़ और अस्पताल",
  "Needed":
    "ज़रूरत",
  "Patient's family":
    "मरीज़ का परिवार",
  "A Rakt Mitra will share the family's contact details with you.":
    "कोई रक्त मित्र आपको परिवार की संपर्क जानकारी देगा।",
  "At the blood bank":
    "ब्लड बैंक में",
  "Say you are donating for this patient and give the hospital's IP / UHID number if there is one. The blood centre's doctor decides if you can donate.":
    "बताएँ कि आप इस मरीज़ के लिए रक्तदान कर रहे हैं, और अगर IP / UHID नंबर हो तो वह दें। आप रक्तदान कर सकते हैं या नहीं, यह ब्लड सेंटर का डॉक्टर तय करता है।",
  "I can't donate after all":
    "मैं रक्तदान नहीं कर पाऊँगा/पाऊँगी",
  "Leave this request? The family will no longer see you as ready to donate.":
    "इस रिक्वेस्ट से हटें? परिवार को अब आप रक्तदान के लिए तैयार नहीं दिखेंगे।",
  "Joining shows you the patient's details and the family's number, and tells them you are ready to donate.":
    "जुड़ने पर आपको मरीज़ की जानकारी और परिवार का नंबर दिखेगा, और उन्हें पता चलेगा कि आप रक्तदान के लिए तैयार हैं।",
  "You can give again from {date}.":
    "आप {date} से फिर रक्तदान कर सकते हैं।",
  "You joined":
    "आप जुड़ चुके हैं",
  "See patient details":
    "मरीज़ की जानकारी देखें",
  "I can donate":
    "मैं रक्तदान कर सकता/सकती हूँ",
  "Open requests you can help with, and requests you've submitted.":
    "खुली रिक्वेस्ट जिनमें आप मदद कर सकते हैं, और आपकी भेजी रिक्वेस्ट।",
  "Open requests":
    "खुली रिक्वेस्ट",
  "Verified by a Rakt Mitra. Join a request when you can give: you'll see the patient's details and the family's number.":
    "रक्त मित्र द्वारा जाँची गई। जब आप दे सकें, किसी रिक्वेस्ट से जुड़ें: आपको मरीज़ की जानकारी और परिवार का नंबर दिखेगा।",
  "Joining is not a commitment, and it is never treated as a confirmed donation. The blood centre will check your eligibility.":
    "जुड़ना कोई वादा नहीं है, और इसे कभी पक्का रक्तदान नहीं माना जाता। ब्लड सेंटर आपकी योग्यता जाँचेगा।",
  "There are no open verified requests at the moment.":
    "अभी कोई खुली जाँची हुई रिक्वेस्ट नहीं है।",
  "Verified requests for your blood group will appear here.":
    "आपके ब्लड ग्रुप की जाँची हुई रिक्वेस्ट यहाँ दिखेंगी।",
  "Want to help with requests?":
    "रिक्वेस्ट में मदद करना चाहते हैं?",
  "Open request":
    "रिक्वेस्ट खोलें",
  "Registered donors with this blood group who can give now can join the request. Joining shows you the patient's details and the family's number. The blood centre will check your eligibility.":
    "इस ब्लड ग्रुप के रजिस्टर्ड डोनर, जो अभी रक्तदान कर सकते हैं, इस रिक्वेस्ट से जुड़ सकते हैं। जुड़ने पर आपको मरीज़ की जानकारी और परिवार का नंबर दिखता है। ब्लड सेंटर आपकी योग्यता जाँचेगा।",
  "I can help — sign in to join":
    "मैं मदद कर सकता/सकती हूँ — जुड़ने के लिए साइन इन करें",
  "A few minutes. A Rakt Mitra checks every request with the hospital. Then you see donors who can give now and contact them directly.":
    "कुछ ही मिनट। रक्त मित्र हर रिक्वेस्ट की अस्पताल से जाँच करते हैं। फिर आपको अभी रक्तदान कर सकने वाले डोनर दिखते हैं और आप उनसे सीधे संपर्क कर सकते हैं।",
  "A free account lets you see eligible donors for your request once it is verified, and keeps you updated.":
    "मुफ़्त खाते से, जाँच के बाद आप अपनी रिक्वेस्ट के लिए योग्य डोनर देख सकते हैं, और आपको अपडेट मिलते रहते हैं।",
  "Relation to patient":
    "मरीज़ से रिश्ता",
  "Donors who join see the phone":
    "जुड़ने वाले डोनर फ़ोन देखते हैं",
  "No (older request)":
    "नहीं (पुरानी रिक्वेस्ट)",

  // --- Request page titles -----------------------------------------------------------
  "Your request":
    "आपकी रिक्वेस्ट",
  "For {group} blood at {hospital}.":
    "{hospital} में {group} खून के लिए।",
  "Thank you. Here is what you need at the blood bank.":
    "धन्यवाद। ब्लड बैंक में आपको यह जानकारी चाहिए होगी।",
};

export default hi;
