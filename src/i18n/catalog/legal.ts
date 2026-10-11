import type { Catalog } from "./types";

/** English UI text → Hindi. Keep the English key exactly as written in the code.
 * Privacy policy, terms of use and contact pages. Legal text: translated faithfully. */
const hi: Catalog = {
  // --- Shared ------------------------------------------------------------------
  "Review before production": "इस्तेमाल से पहले जाँच ज़रूरी",

  // --- Privacy policy (src/app/(site)/privacy/page.tsx) -------------------------
  "What personal information Rakt Response collects, why, who can see it, and how to control or delete it.":
    "Rakt Response कौन-सी निजी जानकारी लेता है, क्यों लेता है, उसे कौन देख सकता है, और आप उसे कैसे कंट्रोल कर सकते हैं या मिटा सकते हैं।",
  "Your data": "आपका डेटा",
  "Privacy,": "प्राइवेसी,",
  "in plain words.": "आसान शब्दों में।",
  "What we collect, who sees it, and how to change your mind. Last updated 11 October 2026.":
    "हम क्या जानकारी लेते हैं, उसे कौन देख सकता है, और आप अपना फ़ैसला कैसे बदल सकते हैं। आखिरी बार 11 अक्टूबर 2026 को अपडेट किया गया।",
  "This policy describes how the Rakt Response platform actually handles data. It is not legal advice. The organisation should have it reviewed by a qualified professional against the Digital Personal Data Protection Act, 2023 and its rules before relying on it.":
    "यह नीति बताती है कि Rakt Response प्लेटफ़ॉर्म असल में डेटा को कैसे संभालता है। यह कानूनी सलाह नहीं है। इस पर भरोसा करने से पहले संस्था को इसे किसी योग्य विशेषज्ञ से डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट, 2023 (DPDP Act) और उसके नियमों के हिसाब से जँचवाना चाहिए।",
  "Who we are": "हम कौन हैं",
  "Rakt Response is a community, volunteer-run platform that keeps a register of voluntary blood donors, records their donation history and helps authorised volunteers coordinate verified blood requests. Rakt Response is the data fiduciary for the information described here. Contact details for privacy questions and grievances are on our {link}.":
    "Rakt Response एक सामुदायिक प्लेटफ़ॉर्म है जिसे स्वयंसेवक चलाते हैं। यह स्वैच्छिक रक्तदाताओं की सूची रखता है, उनके रक्तदान का रिकॉर्ड रखता है और अधिकृत स्वयंसेवकों को जाँची गई ब्लड रिक्वेस्ट का तालमेल करने में मदद करता है। यहाँ बताई गई जानकारी के लिए Rakt Response डेटा फ़िड्यूशियरी (यानी इस डेटा के लिए ज़िम्मेदार संस्था) है। प्राइवेसी से जुड़े सवालों और शिकायतों के लिए संपर्क की जानकारी हमारे {link} पर है।",
  "contact page": "संपर्क पेज",
  "What we collect and why": "हम क्या जानकारी लेते हैं और क्यों",
  "Account:": "खाता:",
  "full name, email and password (stored only as a secure hash by our authentication provider) — to create and secure your account.":
    "पूरा नाम, ईमेल और पासवर्ड (पासवर्ड को हमारा ऑथेंटिकेशन प्रोवाइडर सिर्फ़ एक सुरक्षित हैश के रूप में रखता है) — आपका खाता बनाने और उसे सुरक्षित रखने के लिए।",
  "Donor profile:": "डोनर प्रोफ़ाइल:",
  "blood group, a self-declaration that you are 18–65, donation experience, optional display name, optional mobile/WhatsApp number, preferred contact method and optional profile photo — to match and reach donors for blood requests. We do not ask for your date of birth, gender or medical history.":
    "ब्लड ग्रुप, आपकी खुद की यह घोषणा कि आपकी उम्र 18–65 साल है, रक्तदान का अनुभव, दिखने वाला नाम (ज़रूरी नहीं), मोबाइल/WhatsApp नंबर (ज़रूरी नहीं), संपर्क का पसंदीदा तरीका और प्रोफ़ाइल फ़ोटो (ज़रूरी नहीं) — ताकि ब्लड रिक्वेस्ट के लिए सही डोनर ढूँढे जा सकें और उनसे संपर्क हो सके। हम आपकी जन्म तारीख, लिंग या बीमारियों का इतिहास (मेडिकल हिस्ट्री) नहीं पूछते।",
  "Location:": "जगह:",
  "state, district, city, locality and PIN code, and optionally an approximate map point that we round to about 1 km — to find donors near a hospital. We never ask for or store your street address.":
    "राज्य, ज़िला, शहर, इलाका और पिन कोड, और अगर आप चाहें तो मैप पर एक अंदाज़न जगह, जिसे हम लगभग 1 किमी तक राउंड कर देते हैं — ताकि अस्पताल के पास के डोनर ढूँढे जा सकें। हम आपका गली-मकान वाला पता न कभी पूछते हैं, न रखते हैं।",
  "Donation history:": "रक्तदान का रिकॉर्ड:",
  "type (whole blood, SDP, other apheresis), date, centre and area, with whether it is self-reported or verified — to help coordination and to report verified community figures.":
    "प्रकार (होल ब्लड, SDP, दूसरा एफ़ेरेसिस), तारीख, ब्लड बैंक/सेंटर और इलाका, और यह कि जानकारी खुद बताई गई है या जाँची गई है — तालमेल में मदद के लिए और समुदाय के जाँचे हुए आँकड़े बताने के लिए।",
  "Consents:": "सहमतियाँ:",
  "your choices for directory visibility, contact, emergency alerts and sharing a donation summary, with the time each was given or withdrawn.":
    "डायरेक्टरी में दिखने, संपर्क, इमरजेंसी अलर्ट और रक्तदान का सारांश शेयर करने के बारे में आपकी पसंद, और हर सहमति कब दी गई या वापस ली गई, उसका समय।",
  "Blood requests:": "ब्लड रिक्वेस्ट:",
  "requester name and contact, blood group, type of donor needed, hospital, area, time needed, urgency and optional notes. Please do not include patient names, diagnoses or documents.":
    "रिक्वेस्ट करने वाले का नाम और संपर्क, ब्लड ग्रुप, किस तरह के डोनर की ज़रूरत है, अस्पताल, इलाका, कब तक चाहिए, कितनी जल्दी ज़रूरत है और नोट्स (ज़रूरी नहीं)। कृपया मरीज़ का नाम, बीमारी की जानकारी (डायग्नोसिस) या दस्तावेज़ न डालें।",
  "Stories:": "कहानियाँ:",
  "your story, the details you choose to share, optional photo and private follow-up contact. Photos are stripped of hidden metadata (such as GPS location) before storage.":
    "आपकी कहानी, जो जानकारी आप शेयर करना चुनें, फ़ोटो (ज़रूरी नहीं) और आगे बात करने के लिए निजी संपर्क। फ़ोटो सेव करने से पहले उनमें छिपी जानकारी (मेटाडेटा, जैसे GPS लोकेशन) हटा दी जाती है।",
  "Security records:": "सुरक्षा रिकॉर्ड:",
  "audit logs of privileged actions (such as a volunteer viewing contact details), and short-lived rate-limit counters. For requests submitted without an account we keep only a salted one-way hash of your connection address, never the address itself.":
    "खास अधिकार वाले कामों के ऑडिट लॉग (जैसे किसी स्वयंसेवक का संपर्क जानकारी देखना), और थोड़े समय तक रहने वाले रेट-लिमिट काउंटर। बिना खाते के भेजी गई रिक्वेस्ट के लिए हम आपके कनेक्शन एड्रेस (IP एड्रेस) का सिर्फ़ एक सॉल्टेड वन-वे हैश रखते हैं, असली एड्रेस कभी नहीं।",
  "Who can see your information": "आपकी जानकारी कौन देख सकता है",

  // Who can see what (ACCESS table)
  "Name, email, account settings": "नाम, ईमेल, खाते की सेटिंग्स",
  "You; Rakt Response administrators": "आप; Rakt Response के एडमिन",
  "Mobile / WhatsApp number": "मोबाइल / WhatsApp नंबर",
  "You; administrators. A volunteer only when coordinating a verified request and only if you allowed contact (or accepted that volunteer's contact request). Every access is logged.":
    "आप; एडमिन। कोई स्वयंसेवक सिर्फ़ तब, जब वह किसी जाँची गई रिक्वेस्ट का तालमेल कर रहा हो, और सिर्फ़ तब, जब आपने संपर्क की अनुमति दी हो (या उस स्वयंसेवक की संपर्क रिक्वेस्ट मानी हो)। हर बार देखे जाने का रिकॉर्ड रखा जाता है।",
  "Blood group, display name, broad area (city / locality)": "ब्लड ग्रुप, दिखने वाला नाम, मोटे तौर पर इलाका (शहर / मोहल्ला)",
  "Authorised volunteers and administrators — only if you turned on directory visibility. Never public.":
    "अधिकृत स्वयंसेवक और एडमिन — सिर्फ़ तब, जब आपने डायरेक्टरी में दिखना चालू किया हो। कभी सार्वजनिक नहीं।",
  "PIN code and approximate map location": "पिन कोड और मैप पर अंदाज़न जगह",
  "You; volunteers and administrators for search and distance filtering. Never public, never shown on donor cards.":
    "आप; स्वयंसेवक और एडमिन, खोजने और दूरी के हिसाब से छाँटने के लिए। कभी सार्वजनिक नहीं, डोनर कार्ड पर कभी नहीं दिखती।",
  "You; volunteers and administrators. A verified summary appears on directory cards only if you allow it.":
    "आप; स्वयंसेवक और एडमिन। डायरेक्टरी कार्ड पर जाँचा हुआ सारांश सिर्फ़ तब दिखता है, जब आप इसकी अनुमति दें।",
  "Blood request details you submit": "आपकी भेजी गई ब्लड रिक्वेस्ट की जानकारी",
  "You (if signed in); volunteers and administrators. If you allow public listing, only the blood group, donation type, hospital, city/district, needed-by time and urgency of a verified request are public.":
    "आप (अगर आपने साइन इन किया है); स्वयंसेवक और एडमिन। अगर आप सार्वजनिक लिस्टिंग की अनुमति देते हैं, तो जाँची गई रिक्वेस्ट का सिर्फ़ ब्लड ग्रुप, रक्तदान का प्रकार, अस्पताल, शहर/ज़िला, कब तक चाहिए और कितनी जल्दी ज़रूरत है — यही सार्वजनिक होता है।",
  "Stories you submit": "आपकी भेजी गई कहानियाँ",
  "You; administrators. Only the parts you consented to are published, and only after review.":
    "आप; एडमिन। सिर्फ़ वही हिस्से प्रकाशित होते हैं जिनके लिए आपने सहमति दी है, और वह भी जाँच के बाद ही।",
  "Audit logs (who did what, when — without contact details)": "ऑडिट लॉग (किसने क्या और कब किया — संपर्क जानकारी के बिना)",
  Administrators: "एडमिन",

  "We do not sell personal data, show advertising or use analytics or tracking cookies. We do not publish donor lists or phone numbers, and exports of donor data are restricted to authorised administrators and logged.":
    "हम निजी डेटा नहीं बेचते, विज्ञापन नहीं दिखाते, और एनालिटिक्स या ट्रैकिंग कुकीज़ का इस्तेमाल नहीं करते। हम डोनरों की सूची या फ़ोन नंबर प्रकाशित नहीं करते। डोनर डेटा का एक्सपोर्ट सिर्फ़ अधिकृत एडमिन कर सकते हैं और हर एक्सपोर्ट का रिकॉर्ड रखा जाता है।",
  "Your choices and rights": "आपकी पसंद और अधिकार",
  "Turn directory visibility, contact permission, alerts and summary sharing on or off at any time in Privacy & settings.":
    "डायरेक्टरी में दिखना, संपर्क की अनुमति, अलर्ट और सारांश शेयर करना — इन्हें आप कभी भी प्राइवेसी और सेटिंग्स में चालू या बंद कर सकते हैं।",
  "View and correct your profile, location and self-reported history. A verified blood group is corrected through a review request.":
    "अपनी प्रोफ़ाइल, जगह और खुद बताया गया रक्तदान रिकॉर्ड देखें और सुधारें। जाँचा गया ब्लड ग्रुप जाँच की रिक्वेस्ट भेजकर सुधारा जाता है।",
  "Withdraw a story or narrow what it shows; withdrawal removes public access immediately.":
    "अपनी कहानी वापस लें या उसमें दिखने वाली जानकारी कम करें; वापस लेते ही कहानी तुरंत सार्वजनिक रूप से दिखना बंद हो जाती है।",
  "Request deletion of your account from Settings. We remove you from discovery at once and an administrator completes the request.":
    "सेटिंग्स से अपना खाता मिटाने की रिक्वेस्ट करें। हम आपको तुरंत डोनर खोज से हटा देते हैं और फिर कोई एडमिन आपकी रिक्वेस्ट पूरी करता है।",
  "Contact us to access your data, raise a grievance or nominate someone to act for you.":
    "अपना डेटा देखने, शिकायत दर्ज करने या अपनी ओर से काम करने के लिए किसी को नॉमिनेट (नामित) करने के लिए हमसे संपर्क करें।",
  "Service providers": "सेवा देने वाली कंपनियाँ",
  "The platform runs on {supabase} (database, authentication, file storage) and is hosted on {vercel}. Account emails are sent through the authentication provider or an email service configured by the organisation. If you open the optional map, map tiles load from {osm}, which receives your connection address. Data may be processed outside India depending on the hosting region the organisation selects.":
    "यह प्लेटफ़ॉर्म {supabase} (डेटाबेस, ऑथेंटिकेशन, फ़ाइल स्टोरेज) पर चलता है और {vercel} पर होस्ट किया गया है। खाते से जुड़े ईमेल ऑथेंटिकेशन प्रोवाइडर से या संस्था की सेट की हुई ईमेल सेवा से भेजे जाते हैं। अगर आप मैप खोलते हैं (यह ज़रूरी नहीं है), तो मैप टाइल्स {osm} से लोड होती हैं, जिसे आपका कनेक्शन एड्रेस (IP एड्रेस) मिलता है। संस्था होस्टिंग के लिए कौन-सा क्षेत्र चुनती है, उसके हिसाब से डेटा भारत के बाहर भी प्रोसेस हो सकता है।",
  "Cookies and storage": "कुकीज़ और स्टोरेज",
  "We use only essential cookies to keep you signed in. We do not store personal data in your browser's local storage. Our offline support caches only public pages and images, never your private information.":
    "हम सिर्फ़ ज़रूरी कुकीज़ इस्तेमाल करते हैं, ताकि आप साइन इन रहें। हम आपके ब्राउज़र की लोकल स्टोरेज में निजी डेटा नहीं रखते। ऑफ़लाइन सुविधा के लिए हम सिर्फ़ सार्वजनिक पेज और तस्वीरें सेव (कैश) करते हैं, आपकी निजी जानकारी कभी नहीं।",
  Retention: "जानकारी कितने समय तक रखी जाती है",
  "Your account and profile: until you ask us to delete them.": "आपका खाता और प्रोफ़ाइल: जब तक आप इन्हें मिटाने के लिए न कहें।",
  "Deletion requests: your contact details, location and profile are anonymised; aggregated, non-identifying donation counts may remain.":
    "मिटाने की रिक्वेस्ट पर: आपकी संपर्क जानकारी, जगह और प्रोफ़ाइल को गुमनाम कर दिया जाता है; रक्तदान की कुल गिनती, जिससे आपकी पहचान नहीं होती, बनी रह सकती है।",
  "Requester contact details on closed blood requests: removed after about 90 days.":
    "बंद हो चुकी ब्लड रिक्वेस्ट में रिक्वेस्ट करने वाले की संपर्क जानकारी: लगभग 90 दिन बाद हटा दी जाती है।",
  "Audit logs: kept for up to three years to protect donors and investigate misuse.":
    "ऑडिट लॉग: डोनरों की सुरक्षा और गलत इस्तेमाल की जाँच के लिए ज़्यादा से ज़्यादा तीन साल तक रखे जाते हैं।",
  "Rate-limit counters: about two days.": "रेट-लिमिट काउंटर: लगभग दो दिन।",
  Security: "सुरक्षा",
  "Access is controlled by role-based permissions enforced in the database itself (row-level security), not just in the app. Contact details are only released after consent and role checks, access is rate-limited and logged, and connections are encrypted. No system is perfectly secure; please tell us at once if you notice anything wrong.":
    "कौन क्या देख सकता है, यह भूमिका के हिसाब से तय अनुमतियों से कंट्रोल होता है, जो सिर्फ़ ऐप में नहीं बल्कि खुद डेटाबेस में लागू होती हैं (row-level security)। संपर्क जानकारी सिर्फ़ सहमति और भूमिका की जाँच के बाद ही दी जाती है, उसे देखने की एक सीमा (रेट लिमिट) है और हर बार का रिकॉर्ड रखा जाता है, और कनेक्शन एन्क्रिप्टेड होते हैं। कोई भी सिस्टम पूरी तरह सुरक्षित नहीं होता; अगर आपको कुछ भी गलत दिखे, तो तुरंत हमें बताएँ।",
  Children: "बच्चे",
  "Donor registration is only for people aged 18 to 65. Please do not register on behalf of a child.":
    "डोनर रजिस्ट्रेशन सिर्फ़ 18 से 65 साल की उम्र के लोगों के लिए है। कृपया किसी बच्चे की ओर से रजिस्टर न करें।",
  Changes: "बदलाव",
  "We will update this page when our practices change and show the date of the latest version above.":
    "जब हमारे तरीके बदलेंगे, हम यह पेज अपडेट करेंगे और सबसे नए वर्ज़न की तारीख ऊपर दिखाएँगे।",

  // --- Terms of use (src/app/(site)/terms/page.tsx) ------------------------------
  "The rules for using Rakt Response, and what the platform can and cannot do.":
    "Rakt Response इस्तेमाल करने के नियम, और यह प्लेटफ़ॉर्म क्या कर सकता है और क्या नहीं।",
  "The fine print": "ज़रूरी शर्तें",
  "Terms of": "उपयोग की",
  "use.": "शर्तें।",
  "How Rakt Response works, and what it can and can't do. Last updated 11 October 2026.":
    "Rakt Response कैसे काम करता है, और यह क्या कर सकता है और क्या नहीं। आखिरी बार 11 अक्टूबर 2026 को अपडेट किया गया।",
  "These terms describe how the platform works. The organisation should have them reviewed by a qualified professional before relying on them.":
    "ये शर्तें बताती हैं कि प्लेटफ़ॉर्म कैसे काम करता है। इन पर भरोसा करने से पहले संस्था को इन्हें किसी योग्य विशेषज्ञ से जँचवाना चाहिए।",
  "What Rakt Response is": "Rakt Response क्या है",
  "Rakt Response is a free, volunteer-run platform that helps voluntary blood donors register, keep a record of their donations and be reached — with their consent — by authorised volunteers coordinating verified blood requests.":
    "Rakt Response एक मुफ़्त प्लेटफ़ॉर्म है जिसे स्वयंसेवक चलाते हैं। यह स्वैच्छिक रक्तदाताओं को रजिस्टर करने और अपने रक्तदान का रिकॉर्ड रखने में मदद करता है, ताकि जाँची गई ब्लड रिक्वेस्ट का तालमेल करने वाले अधिकृत स्वयंसेवक — उनकी सहमति से — उनसे संपर्क कर सकें।",
  "What Rakt Response is not": "Rakt Response क्या नहीं है",
  "It is not a hospital, blood bank or medical service, and does not give medical advice.":
    "यह अस्पताल, ब्लड बैंक या मेडिकल सेवा नहीं है, और मेडिकल सलाह नहीं देता।",
  "It does not store blood, reserve units, certify compatibility or guarantee that a donor will be available.":
    "यह खून जमा नहीं करता, खून की यूनिट रिज़र्व नहीं करता, ब्लड मैच की पुष्टि नहीं करता और यह गारंटी नहीं देता कि कोई डोनर मिल ही जाएगा।",
  "It does not decide whether anyone is eligible to donate — the blood centre's screening does.":
    "कोई रक्तदान कर सकता है या नहीं, यह Rakt Response तय नहीं करता — यह ब्लड बैंक की जाँच (स्क्रीनिंग) से तय होता है।",
  "In an emergency, always contact the treating hospital or a licensed blood bank first.":
    "इमरजेंसी में हमेशा सबसे पहले इलाज करने वाले अस्पताल या किसी लाइसेंस वाले ब्लड बैंक से संपर्क करें।",
  "Your responsibilities": "आपकी ज़िम्मेदारियाँ",
  "Give accurate information, keep it up to date and only register yourself.":
    "सही जानकारी दें, उसे अपडेट रखें और सिर्फ़ खुद को रजिस्टर करें।",
  "Only submit blood requests that are genuine, and tell us when a request is no longer needed.":
    "सिर्फ़ सच्ची ब्लड रिक्वेस्ट ही भेजें, और जब किसी रिक्वेस्ट की ज़रूरत न रहे तो हमें बताएँ।",
  "Do not include patient names, diagnoses, medical records or other people's personal details in requests or stories unless you have the right to share them.":
    "रिक्वेस्ट या कहानियों में मरीज़ का नाम, बीमारी की जानकारी (डायग्नोसिस), मेडिकल रिकॉर्ड या दूसरे लोगों की निजी जानकारी न डालें, जब तक आपको उसे शेयर करने का अधिकार न हो।",
  "Never offer, request or accept payment for blood. Donation through Rakt Response is voluntary and unpaid.":
    "खून के लिए कभी भी पैसे देने की पेशकश न करें, पैसे न माँगें और न लें। Rakt Response के ज़रिए रक्तदान स्वैच्छिक और बिना पैसे का है।",
  "Do not attempt to scrape, copy, export or misuse donor information, or to access areas you are not authorised for.":
    "डोनर की जानकारी को स्क्रैप, कॉपी या एक्सपोर्ट करने या उसका गलत इस्तेमाल करने की कोशिश न करें, और न ही उन हिस्सों में जाने की कोशिश करें जिनकी आपको अनुमति नहीं है।",
  "Volunteers and administrators": "स्वयंसेवक और एडमिन",
  "Authorised volunteers may only use donor information to coordinate a specific, verified blood request, must respect each donor's consent and contact preferences, and must not keep or share contact details for any other purpose. Access is logged and may be withdrawn at any time.":
    "अधिकृत स्वयंसेवक डोनर की जानकारी का इस्तेमाल सिर्फ़ किसी खास, जाँची गई ब्लड रिक्वेस्ट के तालमेल के लिए कर सकते हैं। उन्हें हर डोनर की सहमति और संपर्क की पसंद का पालन करना होगा, और संपर्क जानकारी किसी भी दूसरे काम के लिए न रखनी है, न शेयर करनी है। हर एक्सेस का रिकॉर्ड रखा जाता है और एक्सेस कभी भी वापस लिया जा सकता है।",
  "Stories and content": "कहानियाँ और सामग्री",
  "When you submit a story you confirm you have the right to share it. You allow Rakt Response to review it and, if approved, publish the parts you consented to on this website. We may correct formatting without changing your meaning. You can ask for corrections or withdraw your story at any time from {link}.":
    "कहानी भेजकर आप पुष्टि करते हैं कि आपको उसे शेयर करने का अधिकार है। आप Rakt Response को उसकी जाँच करने की, और मंज़ूर होने पर जिन हिस्सों के लिए आपने सहमति दी है उन्हें इस वेबसाइट पर प्रकाशित करने की अनुमति देते हैं। हम आपकी बात का मतलब बदले बिना फ़ॉर्मैटिंग ठीक कर सकते हैं। आप कभी भी {link} से सुधार माँग सकते हैं या अपनी कहानी वापस ले सकते हैं।",
  Suspension: "खाता सस्पेंड करना",
  "We may hide, correct or remove information and suspend accounts that break these terms, put donors at risk or appear fraudulent.":
    "जो जानकारी या खाते इन शर्तों को तोड़ते हैं, डोनरों को खतरे में डालते हैं या धोखाधड़ी वाले लगते हैं, हम उस जानकारी को छिपा, सुधार या हटा सकते हैं और ऐसे खातों को सस्पेंड कर सकते हैं।",
  Liability: "ज़िम्मेदारी (लायबिलिटी)",
  "Rakt Response is provided free of charge, as is, by volunteers. To the extent permitted by law, we are not liable for decisions made by donors, requesters, hospitals or blood banks, or for any donor being unavailable.":
    "Rakt Response स्वयंसेवकों द्वारा मुफ़्त में, जैसा है वैसा ही (as is) दिया जाता है। कानून जितनी छूट देता है, उस हद तक हम डोनरों, रिक्वेस्ट करने वालों, अस्पतालों या ब्लड बैंकों के फ़ैसलों के लिए, या किसी डोनर के उपलब्ध न होने के लिए ज़िम्मेदार नहीं हैं।",
  "Governing law": "लागू कानून",
  "These terms are governed by the laws of India.": "ये शर्तें भारत के कानूनों के तहत लागू होती हैं।",
  "Questions? See our {privacy} or {contact}.": "कोई सवाल? हमारी {privacy} देखें या {contact}।",
  "privacy policy": "प्राइवेसी नीति",
  "contact the team": "टीम से संपर्क करें",

  // --- Contact (src/app/(site)/contact/page.tsx) ---------------------------------
  "How to reach the Rakt Response team, report inaccurate information or request a correction.":
    "Rakt Response टीम से कैसे संपर्क करें, गलत जानकारी की शिकायत कैसे करें या सुधार कैसे माँगें।",
  "Talk to": "टीम से",
  "the team.": "बात करें।",
  "Volunteers reply as fast as they can. We're not an emergency service.":
    "स्वयंसेवक जितनी जल्दी हो सके जवाब देते हैं। हम इमरजेंसी सेवा नहीं हैं।",
  "Need blood urgently?": "खून की जल्दी ज़रूरत है?",
  "Contact the treating hospital or the nearest licensed blood bank first. Then {link} so our volunteers can help find voluntary donors.":
    "पहले इलाज करने वाले अस्पताल या नज़दीकी लाइसेंस वाले ब्लड बैंक से संपर्क करें। फिर {link}, ताकि हमारे स्वयंसेवक स्वैच्छिक डोनर ढूँढने में मदद कर सकें।",
  "submit a blood request": "ब्लड रिक्वेस्ट भेजें",
  "Reach the team": "टीम से संपर्क करें",
  "Currently serving: {area}": "अभी यहाँ सेवा दे रहे हैं: {area}",
  "Public contact details have not been published yet. Signed-in members can reach volunteers through their blood requests and notifications.":
    "सार्वजनिक संपर्क जानकारी अभी प्रकाशित नहीं की गई है। साइन इन किए हुए सदस्य अपनी ब्लड रिक्वेस्ट और सूचनाओं के ज़रिए स्वयंसेवकों से संपर्क कर सकते हैं।",
  "Report inaccurate information": "गलत जानकारी की शिकायत करें",
  "Seen a request, story or figure that looks wrong? Tell us the page link and what is incorrect. Please don't include patient medical details.":
    "कोई रिक्वेस्ट, कहानी या आँकड़ा गलत लगा? हमें पेज का लिंक और क्या गलत है, यह बताएँ। कृपया मरीज़ की मेडिकल जानकारी न डालें।",
  "Email a report": "ईमेल से शिकायत भेजें",
  "Corrections, withdrawals & privacy": "सुधार, वापसी और प्राइवेसी",
  "Manage your consent, correct your profile or request deletion from your account. Story contributors can withdraw or request corrections from My stories.":
    "अपने खाते से अपनी सहमति बदलें, प्रोफ़ाइल सुधारें या खाता मिटाने की रिक्वेस्ट करें। कहानी भेजने वाले “मेरी कहानियाँ” से अपनी कहानी वापस ले सकते हैं या सुधार माँग सकते हैं।",
};

export default hi;
