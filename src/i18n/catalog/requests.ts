import type { Catalog } from "./types";

/** English UI text → Hindi. Keep the English key exactly as written in the code. */
const hi: Catalog = {
  // --- Find blood (src/app/(site)/blood-requests/page.tsx) ---------------------
  "Submit a blood request for volunteer coordination and see verified requests where voluntary donors can help.":
    "खून की रिक्वेस्ट भेजें, ताकि स्वयंसेवक मदद कर सकें। साथ ही वे जाँची गई रिक्वेस्ट देखें जिनमें स्वैच्छिक डोनर मदद कर सकते हैं।",
  "Need blood?": "खून चाहिए?",
  "We'll rally donors.": "हम डोनर जुटाएँगे।",
  "Tell us what's needed. A volunteer verifies it, then reaches out to matching donors who said yes to being contacted.":
    "बताइए क्या चाहिए। एक स्वयंसेवक पहले इसकी जाँच करेगा, फिर उन डोनर से बात करेगा जिनका ब्लड ग्रुप मिलता है और जिन्होंने संपर्क के लिए हाँ कहा है।",
  "Verified before sharing": "शेयर से पहले जाँच",
  "Free, always": "हमेशा मुफ़्त",
  "Your details stay private": "आपकी जानकारी प्राइवेट रहती है",
  "Submit a request": "रिक्वेस्ट भेजें",
  "Emergency? Call the hospital first": "इमरजेंसी है? पहले अस्पताल को फ़ोन करें",
  "The treating hospital or nearest licensed blood bank comes first. We coordinate voluntary donors — we can't reserve blood, check compatibility or guarantee a donor.":
    "सबसे पहले इलाज करने वाले अस्पताल या नज़दीकी लाइसेंस वाले ब्लड बैंक से बात करें। हम स्वैच्छिक डोनर से तालमेल करते हैं — हम खून रिज़र्व नहीं कर सकते, ब्लड मैच की जाँच नहीं कर सकते और डोनर मिलने की गारंटी नहीं दे सकते।",
  "Can you help?": "क्या आप मदद कर सकते हैं?",
  "Verified requests": "जाँची गई रिक्वेस्ट",
  "Checked by a volunteer and shared with permission. Tap one to respond.":
    "स्वयंसेवक ने इनकी जाँच की है और अनुमति से शेयर किया है। जवाब देने के लिए किसी एक पर टैप करें।",
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
  "Verified by a Rakt Response volunteer on {date}.": "Rakt Response के स्वयंसेवक ने {date} को इसकी जाँच की।",
  "Registered donors can let volunteers know they're available. A volunteer will contact you with next steps — please don't go to the hospital until they confirm, and the blood centre will check your eligibility.":
    "रजिस्टर्ड डोनर स्वयंसेवकों को बता सकते हैं कि वे उपलब्ध हैं। एक स्वयंसेवक आपसे संपर्क करके आगे का तरीका बताएगा — जब तक वे पुष्टि न करें, कृपया अस्पताल न जाएँ। आप रक्तदान कर सकते हैं या नहीं, यह ब्लड बैंक जाँचेगा।",
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
  "Ask Rakt Response volunteers to help find voluntary donors for a hospital requirement.":
    "अस्पताल की ज़रूरत के लिए स्वैच्छिक डोनर ढूँढने में Rakt Response के स्वयंसेवकों से मदद माँगें।",
  Request: "रिक्वेस्ट",
  "About two minutes. A volunteer verifies every request before any donor is contacted.":
    "बस दो मिनट लगेंगे। किसी भी डोनर से संपर्क करने से पहले स्वयंसेवक हर रिक्वेस्ट की जाँच करता है।",
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
  "It looks like a request for the same blood group at this hospital was submitted recently. Volunteers will check both so donors aren't contacted twice.":
    "लगता है इसी अस्पताल के लिए इसी ब्लड ग्रुप की रिक्वेस्ट हाल ही में भेजी गई है। स्वयंसेवक दोनों को देखेंगे, ताकि डोनर से दो बार संपर्क न हो।",
  "A volunteer will verify the request with you or the hospital before contacting donors.":
    "डोनर से संपर्क करने से पहले स्वयंसेवक आपसे या अस्पताल से रिक्वेस्ट की पुष्टि करेगा।",
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
  "How volunteers can reach you": "स्वयंसेवक आपसे कैसे संपर्क करें",
  "Kept private — only authorised volunteers see these details.": "यह जानकारी प्राइवेट रहती है — इसे सिर्फ़ अधिकृत स्वयंसेवक देखते हैं।",
  "Your name": "आपका नाम",
  Phone: "फ़ोन",
  "Best way to reach you": "आपसे संपर्क का सबसे अच्छा तरीका",
  "Anything volunteers should know? (optional)": "स्वयंसेवकों को कुछ और बताना है? (ज़रूरी नहीं)",
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
  "A volunteer asked if they may contact you. Your details are shared only if you accept.":
    "एक स्वयंसेवक पूछ रहे हैं कि क्या वे आपसे संपर्क कर सकते हैं। आप हाँ कहेंगे, तभी आपकी जानकारी शेयर होगी।",
  "Respond by {date}": "{date} तक जवाब दें",
  "Share my contact details": "मेरी संपर्क जानकारी शेयर करें",
  Decline: "मना करें",
  "Requests that match you": "आपसे मेल खाती रिक्वेस्ट",
  "Respond only if you can currently donate. A volunteer will confirm before you travel.":
    "जवाब तभी दें जब आप अभी रक्तदान कर सकते हों। आपके निकलने से पहले स्वयंसेवक पुष्टि करेगा।",
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
  "Cancel this request? Volunteers will stop contacting donors.": "यह रिक्वेस्ट रद्द करें? स्वयंसेवक डोनर से संपर्क करना बंद कर देंगे।",
  "You haven't submitted any requests": "आपने अभी कोई रिक्वेस्ट नहीं भेजी है",
  "If someone needs blood, submit a request and a volunteer will verify it.": "अगर किसी को खून चाहिए, तो रिक्वेस्ट भेजें। स्वयंसेवक उसकी जाँच करेगा।",
};

export default hi;
