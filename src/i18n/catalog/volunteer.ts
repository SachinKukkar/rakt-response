import type { Catalog } from "./types";

/** English UI text → Hindi. Keep the English key exactly as written in the code. */
const hi: Catalog = {
  // --- Volunteer overview (src/app/(member)/volunteer/page.tsx) ---------------
  "Coordination overview": "तालमेल का सारांश",
  "Verify requests, coordinate with donors and follow up after donation.":
    "रिक्वेस्ट जाँचें, डोनरों से तालमेल करें और रक्तदान के बाद उनका हाल-चाल लें।",
  Summary: "सारांश",
  "Awaiting verification": "पुष्टि का इंतज़ार",
  "Urgent, unverified": "जल्दी ज़रूरत, पुष्टि नहीं हुई",
  "Active requests": "चालू रिक्वेस्ट",
  "Follow-ups due (mine)": "मेरे बाकी फ़ॉलो-अप",
  "My assignments": "मेरी ज़िम्मेदारियाँ",
  "Donors interested (7 days)": "तैयार डोनर (7 दिन)",
  "Donation records to review": "जाँच के लिए रक्तदान रिकॉर्ड",
  "Waiting for verification": "पुष्टि का इंतज़ार",
  All: "सब",
  "Nothing waiting for verification": "पुष्टि के लिए कुछ बाकी नहीं",
  "Follow up now": "अभी फ़ॉलो-अप करें",
  "Follow up {when}": "फ़ॉलो-अप: {when}",
  "You aren't coordinating any requests. Take one from the queue.": "आप अभी किसी रिक्वेस्ट का तालमेल नहीं कर रहे हैं। सूची में से एक रिक्वेस्ट लें।",
  "Recent donor interest": "हाल में तैयार हुए डोनर",
  Donor: "डोनर",
  "No recent responses.": "हाल में कोई जवाब नहीं।",
  "Recent coordination activity": "हाल में तालमेल का काम",
  Request: "रिक्वेस्ट",
  someone: "कोई",
  "No activity yet.": "अभी कोई गतिविधि नहीं।",
  "Run expiry & reminders now": "समय-सीमा जाँच और रिमाइंडर अभी चलाएँ",

  // Request history events (request_events.event_type, "_" shown as spaces)
  created: "बनाई गई",
  "status changed": "स्थिति बदली",
  assigned: "ज़िम्मेदारी दी गई",
  "assignment updated": "ज़िम्मेदारी अपडेट हुई",
  "donor contacted": "डोनर से संपर्क किया",
  "contact requested": "संपर्क की अनुमति माँगी",
  "donor responded": "डोनर ने जवाब दिया",
  "outcome recorded": "नतीजा दर्ज किया",
  edited: "बदलाव किया",
  "duplicate flagged": "डुप्लिकेट बताई गई",
  // Request statuses as stored ("_" shown as spaces)
  draft: "ड्राफ़्ट",
  submitted: "भेजी गई",
  "under verification": "जाँच चल रही है",
  verified: "पुष्टि हुई",
  "in coordination": "तालमेल चल रहा है",
  fulfilled: "पूरी हुई",
  cancelled: "रद्द",
  expired: "समय खत्म",
  rejected: "पुष्टि नहीं हुई",
  pending: "बाकी",
  // Assignment statuses and staff roles as stored
  active: "चालू",
  completed: "पूरा हुआ",
  released: "छोड़ दिया",
  "Rakt Mitra": "रक्त मित्र",
  admin: "एडमिन",

  // --- Request queue ------------------------------------------------------------
  "Request queue": "रिक्वेस्ट की सूची",
  "Blood requests": "खून की रिक्वेस्ट",
  "Verify new requests before any donor is contacted. Close requests honestly.":
    "किसी भी डोनर से संपर्क करने से पहले नई रिक्वेस्ट की पुष्टि करें। रिक्वेस्ट बंद करते समय सही जानकारी दें।",
  "Needs verification": "पुष्टि बाकी",
  Active: "चालू",
  Closed: "बंद",
  "Request status": "रिक्वेस्ट की स्थिति",
  "Filter requests": "रिक्वेस्ट छाँटें",
  "Blood group": "ब्लड ग्रुप",
  "Donor type": "डोनर का प्रकार",
  District: "ज़िला",
  Filter: "छाँटें",
  "Possible duplicate": "शायद डुप्लिकेट",
  "No requests here": "यहाँ कोई रिक्वेस्ट नहीं",
  "Try another tab or clear the filters.": "दूसरा टैब देखें या फ़िल्टर हटाएँ।",

  // --- Request coordination (requests/[id]) -------------------------------------
  "Request coordination": "रिक्वेस्ट का तालमेल",
  "Public listing allowed": "सबको दिखाने की अनुमति है",
  "Not publicly listed": "सबको नहीं दिखाई जाती",
  "Needed by": "कब तक चाहिए:",
  "{count} unit(s)": "{count} यूनिट",
  "Requester notes: {notes}": "रिक्वेस्ट करने वाले के नोट: {notes}",
  "A similar open request exists.": "ऐसी ही एक और खुली रिक्वेस्ट है।",
  "Compare requests": "दोनों रिक्वेस्ट मिलाकर देखें",
  "before contacting donors.": "— यह डोनर से संपर्क करने से पहले करें।",
  "SDP request: prefer donors with declared SDP history, but never assume eligibility. The apheresis centre screens donors and decides timing.":
    "SDP रिक्वेस्ट: जिन डोनर ने पहले SDP देना बताया है उन्हें पहले चुनें, पर कभी यह न मानें कि वे रक्तदान कर सकते हैं। एफ़ेरेसिस सेंटर डोनर की जाँच करता है और समय तय करता है।",
  "Requester (private)": "रिक्वेस्ट करने वाले (निजी)",
  Name: "नाम",
  Prefers: "पसंदीदा तरीका",
  "Signed-in member": "साइन इन किए हुए सदस्य",
  "Submitted without an account": "बिना खाते के भेजी गई",
  Status: "स्थिति",
  "Closing note: {reason}": "बंद करने का नोट: {reason}",
  "Rakt Mitras coordinating": "तालमेल कर रहे रक्त मित्र",
  "follow up {when}": "फ़ॉलो-अप {when}",
  "Nobody is coordinating this request yet.": "अभी कोई इस रिक्वेस्ट का तालमेल नहीं कर रहा है।",
  "I'll coordinate this": "मैं इसका तालमेल करूँगा/करूँगी",
  Assign: "ज़िम्मेदारी दें",
  "Assign a Rakt Mitra": "रक्त मित्र को ज़िम्मेदारी दें",
  "Matching donors": "मेल खाते डोनर",
  "Same blood group, same district, directory-visible. Compatibility beyond an exact group match is for the hospital to decide.":
    "वही ब्लड ग्रुप, वही ज़िला, और डोनर सूची में दिखने वाले। ठीक वही ग्रुप न होने पर खून मेल खाएगा या नहीं, यह अस्पताल तय करता है।",
  "Search directory": "डोनर सूची में खोजें",
  "Donor contact is available only once a request is verified and active.": "डोनर से संपर्क तभी हो सकता है जब रिक्वेस्ट की पुष्टि हो जाए और वह चालू हो।",
  "No matching donors in this district": "इस ज़िले में कोई मेल खाता डोनर नहीं",
  "Search the directory with a wider area, or check nearby districts.": "बड़े इलाके में डोनर सूची खोजें, या आस-पास के ज़िले देखें।",
  "active {when}": "आखिरी बार सक्रिय {when}",
  "SDP history": "पहले SDP दिया है",
  "Open to contact": "संपर्क के लिए तैयार",
  "Not open now": "अभी संपर्क के लिए तैयार नहीं",
  "Last verified:": "आखिरी पुष्टि:",
  "whole blood {date}": "होल ब्लड {date}",
  "(not an eligibility decision)": "(इससे योग्यता तय नहीं होती)",
  "Contact attempts: {count}": "संपर्क की कोशिशें: {count}",
  "Other donors on this request": "इस रिक्वेस्ट पर दूसरे डोनर",
  "{count} attempt(s)": "{count} कोशिश",
  "Edit request details": "रिक्वेस्ट की जानकारी बदलें",
  "Save details": "जानकारी सेव करें",
  "Hospital / blood bank": "अस्पताल / ब्लड बैंक",
  City: "शहर",
  Units: "यूनिट",
  Urgency: "कितनी जल्दी",
  "Needed by (India time)": "कब तक चाहिए (भारतीय समय)",
  Notes: "नोट",
  History: "इतिहास",
  "Team member": "टीम सदस्य",
  "Internal notes": "अंदरूनी नोट",
  "Visible to Rakt Mitras and admins only.": "सिर्फ़ रक्त मित्र और एडमिन देख सकते हैं।",
  "Add note": "नोट जोड़ें",
  Note: "नोट",
  "e.g. Spoke to blood bank, 2 units confirmed needed.": "जैसे: ब्लड बैंक से बात हुई, 2 यूनिट की ज़रूरत पक्की है।",

  // --- Donor directory ------------------------------------------------------------
  "The directory could not be searched right now.": "अभी डोनर सूची में खोज नहीं हो पाई।",
  "No donors match these filters": "इन फ़िल्टर से कोई डोनर नहीं मिला",
  "Try a wider area, remove the 'open to contact' filter, or search nearby districts.":
    "बड़ा इलाका चुनें, 'संपर्क के लिए तैयार' फ़िल्टर हटाएँ, या आस-पास के ज़िलों में खोजें।",
  "{count} donor found": "{count} डोनर मिला",
  "{count} donors found": "{count} डोनर मिले",
  "Active {when}": "आखिरी बार सक्रिय {when}",
  "Not available now": "अभी उपलब्ध नहीं",
  "Verified: {count} whole blood": "पुष्टि हुई: {count} होल ब्लड",
  "(last {date})": "(आखिरी {date})",
  "Choose an active request above to contact this donor.": "इस डोनर से संपर्क करने के लिए ऊपर एक चालू रिक्वेस्ट चुनें।",
  "Contact details are never listed here. They open for one verified request at a time, and every access is logged.":
    "संपर्क जानकारी यहाँ कभी नहीं दिखती। यह एक बार में एक जाँची गई रिक्वेस्ट के लिए खुलती है, और हर बार खोलने का रिकॉर्ड रहता है।",
  "Request context": "किस रिक्वेस्ट के लिए",
  Coordinating: "तालमेल:",
  "at {hospital}": "अस्पताल: {hospital}",
  "Back to request": "रिक्वेस्ट पर वापस जाएँ",
  "Contact donors for a verified request": "पुष्टि हुई रिक्वेस्ट के लिए डोनर से संपर्क करें",
  "Choose a request…": "रिक्वेस्ट चुनें…",
  "No active verified requests": "पुष्टि हुई कोई चालू रिक्वेस्ट नहीं",
  "Use request": "यह रिक्वेस्ट चुनें",
  "Matching here is by declared blood group only. Compatibility, cross-matching and donor eligibility are decided by the hospital and blood centre.":
    "यहाँ सिर्फ़ डोनर के बताए ब्लड ग्रुप से मिलान होता है। खून मेल खाएगा या नहीं, क्रॉस-मैचिंग और डोनर की योग्यता अस्पताल और ब्लड बैंक तय करते हैं।",

  // Directory filters (src/components/volunteer/directory-filters.tsx)
  "Search by name, city, locality or PIN": "नाम, शहर, इलाका या पिन कोड से खोजें",
  "Name, city, locality or PIN": "नाम, शहर, इलाका या पिन कोड",
  "Loading results": "नतीजे लोड हो रहे हैं",
  Filters: "फ़िल्टर",
  "Filter donors": "डोनर छाँटें",
  "Search by blood group, area and availability. Contact details never appear here.":
    "ब्लड ग्रुप, इलाके और उपलब्धता से खोजें। संपर्क जानकारी यहाँ कभी नहीं दिखती।",
  "Blood groups": "ब्लड ग्रुप",
  State: "राज्य",
  Any: "कोई भी",
  "City / town": "शहर / कस्बा",
  "Locality contains": "इलाके के नाम में",
  "PIN code": "पिन कोड",
  "Has whole blood history": "पहले होल ब्लड दिया है",
  "Has sdp (single donor platelets) history": "पहले SDP (प्लेटलेट्स) दिया है",
  "Has other apheresis history": "पहले दूसरा एफ़ेरेसिस दिया है",
  "Active recently": "हाल में सक्रिय",
  "Any time": "कभी भी",
  "Last 30 days": "पिछले 30 दिन",
  "Last 3 months": "पिछले 3 महीने",
  "Last year": "पिछला एक साल",
  "Sort by": "किस क्रम में",
  Relevance: "सबसे सही मेल",
  Locality: "इलाका",
  "Recently active": "हाल में सक्रिय",
  "Distance (needs a point)": "दूरी (जगह चुनना ज़रूरी)",
  "Verified donors only": "सिर्फ़ पुष्टि वाले डोनर",
  "Currently open to contact": "अभी संपर्क के लिए तैयार",
  "Within distance (approximate locations only)": "कितनी दूरी तक (सिर्फ़ अंदाज़न जगह)",
  "No distance filter": "दूरी का कोई फ़िल्टर नहीं",
  Reset: "सब हटाएँ",
  "Show donors": "डोनर दिखाएँ",

  // --- Contact & coordination forms (src/components/volunteer/coordination-forms.tsx)
  "Access logged. Use only for request {code}. Preferred: {method}.": "यह देखना दर्ज हो गया है। सिर्फ़ रिक्वेस्ट {code} के लिए इस्तेमाल करें। पसंदीदा तरीका: {method}।",
  "Call {phone}": "कॉल करें {phone}",
  "No contact details on file.": "कोई संपर्क जानकारी दर्ज नहीं है।",
  "Log a contact attempt": "संपर्क की कोशिश दर्ज करें",
  "View contact details": "संपर्क जानकारी देखें",
  "Ask for permission to contact": "संपर्क की अनुमति माँगें",
  "Contact request sent — waiting for the donor.": "संपर्क की रिक्वेस्ट भेज दी गई — डोनर के जवाब का इंतज़ार है।",
  "The donor declined to share contact details for this request.": "डोनर ने इस रिक्वेस्ट के लिए संपर्क जानकारी देने से मना किया है।",
  "Send contact request": "संपर्क की रिक्वेस्ट भेजें",
  "Short message (no patient details)": "छोटा संदेश (मरीज़ की जानकारी न लिखें)",
  "e.g. Platelets needed tomorrow morning at the hospital.": "जैसे: कल सुबह अस्पताल में प्लेटलेट्स चाहिए।",
  Response: "जवाब",
  "No change": "कोई बदलाव नहीं",
  Outcome: "नतीजा",
  "This request is closed.": "यह रिक्वेस्ट बंद हो चुकी है।",
  "Move to": "नई स्थिति",
  "Reason / confirmation (required)": "कारण / पुष्टि (ज़रूरी)",
  "Note (optional)": "नोट (ज़रूरी नहीं)",
  "e.g. Hospital blood bank confirmed donation completed": "जैसे: अस्पताल के ब्लड बैंक ने रक्तदान पूरा होने की पुष्टि की",
  "Verifying alerts opted-in donors of this blood group in the district (in-app only).":
    "पुष्टि करते ही इस ज़िले में इस ब्लड ग्रुप के उन डोनर को सूचना जाएगी जिन्होंने सूचना के लिए हाँ कहा है (सिर्फ़ ऐप में)।",
  "Only mark fulfilled when the hospital or requester confirms the need was met — not when a donor is merely interested.":
    "'पूरी हुई' तभी चुनें जब अस्पताल या रिक्वेस्ट करने वाला बताए कि ज़रूरत पूरी हो गई — सिर्फ़ डोनर के तैयार होने पर नहीं।",
  "Update status": "स्थिति अपडेट करें",

  // --- My coordination -------------------------------------------------------------
  "Requests you're coordinating, with follow-up reminders.": "जिन रिक्वेस्ट का आप तालमेल कर रहे हैं, फ़ॉलो-अप रिमाइंडर के साथ।",
  "No active assignments": "कोई चालू ज़िम्मेदारी नहीं",
  "Take a request from the queue to start coordinating.": "तालमेल शुरू करने के लिए सूची से एक रिक्वेस्ट लें।",
  "Needed by {date}": "{date} तक चाहिए",
  "Follow-up due now": "फ़ॉलो-अप का समय हो गया",
  "Still coordinating": "अभी तालमेल चल रहा है",
  Completed: "पूरा हुआ",
  "Release to another Rakt Mitra": "दूसरे रक्त मित्र को सौंपें",
  "Next follow-up (India time)": "अगला फ़ॉलो-अप (भारतीय समय)",
  "Notes for yourself": "अपने लिए नोट",
  "Completed or released": "पूरे हुए या छोड़े गए",

  // --- Donation records review -------------------------------------------------------
  "Review self-reported donations. Whole blood and SDP records are verified separately.":
    "डोनर के खुद बताए रक्तदान जाँचें। होल ब्लड और SDP रिकॉर्ड की पुष्टि अलग-अलग होती है।",
  "You can view records, but verifying them needs the “verify donations” permission from an administrator.":
    "आप रिकॉर्ड देख सकते हैं, पर उनकी पुष्टि करने के लिए एडमिन से “रक्तदान की पुष्टि” की अनुमति चाहिए।",
  "Record status": "रिकॉर्ड की स्थिति",
  "No records here": "यहाँ कोई रिकॉर्ड नहीं",
  "added {date}": "{date} को जोड़ा",
  "Reviewer note: {note}": "जाँच करने वाले का नोट: {note}",
  Verify: "पुष्टि करें",
  Reason: "कारण",
  "Reason (required)": "कारण (ज़रूरी)",
  "Your own record — another reviewer must verify it.": "यह आपका अपना रिकॉर्ड है — इसकी पुष्टि कोई दूसरा करेगा।",
  "Verify only with proportionate evidence (e.g. a donor card, certificate or confirmation from the blood centre). Verification confirms the record, not the donor's eligibility.":
    "पुष्टि तभी करें जब ठीक-ठाक सबूत हो (जैसे डोनर कार्ड, सर्टिफ़िकेट या ब्लड बैंक से पुष्टि)। पुष्टि से रिकॉर्ड सही माना जाता है, इससे डोनर की योग्यता तय नहीं होती।",

  // --- After donation (Rakt Mitras) --------------------------------------------------
  "Follow up after donation":
    "रक्तदान के बाद हाल-चाल",
  "Donors who gave blood for a request. Call or message them: thank them and ask how they feel. Then mark it done. Their contact opens for this (logged) even after the request closes.":
    "जिन डोनरों ने किसी रिक्वेस्ट के लिए रक्तदान किया। उन्हें कॉल या मैसेज करें: धन्यवाद दें और पूछें कि वे कैसा महसूस कर रहे हैं। फिर इसे पूरा मार्क करें। इसके लिए उनका संपर्क रिक्वेस्ट बंद होने के बाद भी खुलता है (हर बार दर्ज होता है)।",
  "No donors waiting for a follow-up":
    "किसी डोनर का हाल-चाल बाकी नहीं",
  "When a donor tells us they gave blood, or you record it, they appear here.":
    "जब कोई डोनर बताता है कि उसने रक्तदान किया, या आप इसे दर्ज करते हैं, तो वह यहाँ दिखता है।",
  "Donated on {date}":
    "{date} को रक्तदान किया",
  "Donated":
    "रक्तदान किया",
  "Reported by the donor":
    "डोनर ने बताया",
  "Recorded by a Rakt Mitra":
    "रक्त मित्र ने दर्ज किया",
  "Mark followed up":
    "हाल-चाल पूरा मार्क करें",
  "Note for the team (optional)":
    "टीम के लिए नोट (ज़रूरी नहीं)",
  "e.g. Feeling fine, thanked them.":
    "जैसे: ठीक महसूस कर रहे हैं, धन्यवाद दिया।",
  "Donors to follow up":
    "हाल-चाल बाकी वाले डोनर",
  "Followed up":
    "हाल-चाल लिया",
  "Follow-up due":
    "हाल-चाल बाकी",
  "Follow-up recorded. Thank you.":
    "हाल-चाल दर्ज हो गया। धन्यवाद।",
  "Days after a request closes in which a donor can still say they donated":
    "रिक्वेस्ट बंद होने के बाद कितने दिन तक डोनर बता सकता है कि उसने रक्तदान किया",
  "Days a Rakt Mitra can open a donor's contact to follow up after their donation":
    "रक्तदान के बाद हाल-चाल के लिए रक्त मित्र कितने दिन तक डोनर का संपर्क खोल सकता है",

  // --- After donation (recently done) ------------------------------------------------
  "Followed up recently":
    "हाल ही में हाल-चाल लिया",
  "by {name}, {when}":
    "{name} ने, {when}",
};

export default hi;
