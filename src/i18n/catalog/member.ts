import type { Catalog } from "./types";

/** English UI text → Hindi. Keep the English key exactly as written in the code. */
const hi: Catalog = {
  // --- Dashboard (src/app/(member)/dashboard/page.tsx) -------------------------
  "Your password was updated.": "आपका पासवर्ड बदल दिया गया है।",
  "Welcome to Rakt Response": "Rakt Response में आपका स्वागत है",
  "Your account is active. Your profile is private by default — review your choices in Privacy & settings at any time.":
    "आपका खाता चालू है। आपकी प्रोफ़ाइल शुरू से प्राइवेट रहती है — अपनी पसंद कभी भी 'प्राइवेसी और सेटिंग्स' में देख और बदल सकते हैं।",
  "Account deletion requested": "खाता हटाने की रिक्वेस्ट भेजी गई",
  "You were removed from discovery on {date}.": "{date} को आपको खोज और सूचियों से हटा दिया गया।",
  "Manage request": "रिक्वेस्ट देखें",
  "Welcome back,": "फिर से स्वागत है,",
  "You're open to being contacted for requests.": "रिक्वेस्ट के लिए आपसे संपर्क किया जा सकता है।",
  "You're currently not available for contact.": "अभी आप संपर्क के लिए उपलब्ध नहीं हैं।",
  "Pause availability": "अभी उपलब्ध नहीं",
  "I'm available": "मैं उपलब्ध हूँ",
  "Quick actions": "जल्दी के काम",
  "Record a donation": "रक्तदान दर्ज करें",
  "Requests ({count} waiting)": "रिक्वेस्ट ({count} इंतज़ार में)",
  "Requests for me": "मेरे लिए रिक्वेस्ट",
  "Availability & privacy": "उपलब्धता और प्राइवेसी",
  "Profile {percent}% complete": "प्रोफ़ाइल {percent}% पूरी",
  Complete: "पूरी करें",
  "Profile completion": "प्रोफ़ाइल कितनी पूरी है",
  "Add your blood group": "अपना ब्लड ग्रुप जोड़ें",
  "Add a mobile number": "मोबाइल नंबर जोड़ें",
  "Add your area": "अपना इलाका जोड़ें",
  "Review your contact & directory choices": "संपर्क और सूची से जुड़ी अपनी पसंद देखें",
  "Record your donation history": "अपने पिछले रक्तदान दर्ज करें",
  "Your donations": "आपके रक्तदान",
  History: "रिकॉर्ड",
  "You registered as a member. Add your blood group and area from {link} whenever you're ready to join the donor register.":
    "आपने सदस्य के रूप में खाता बनाया है। जब आप डोनर सूची में जुड़ना चाहें, तो {link} में अपना ब्लड ग्रुप और इलाका जोड़ें।",
  "your profile": "अपनी प्रोफ़ाइल",
  "Requests that match you": "आपसे मेल खाती रिक्वेस्ट",
  "Verified requests for your blood group in your district, or ones you were asked about.":
    "आपके ज़िले में आपके ब्लड ग्रुप की जाँची हुई रिक्वेस्ट, या जिनके बारे में आपसे पूछा गया।",
  All: "सब",
  "No matching requests right now": "अभी कोई मेल खाती रिक्वेस्ट नहीं",
  "We'll notify you in the app if a verified request matches your preferences.":
    "अगर कोई जाँची हुई रिक्वेस्ट आपकी पसंद से मेल खाती है, तो हम ऐप में आपको बताएँगे।",
  "Latest notifications": "नई सूचनाएँ",
  "No notifications yet.": "अभी कोई सूचना नहीं।",

  // --- Donations ----------------------------------------------------------------
  "Whole blood and SDP are tracked separately. New records are self-reported until an authorised volunteer verifies them.":
    "होल ब्लड और SDP का रिकॉर्ड अलग-अलग रखा जाता है। नए रिकॉर्ड तब तक 'खुद बताया गया' रहते हैं जब तक कोई अधिकृत स्वयंसेवक उनकी पुष्टि न कर दे।",
  "All records": "सारे रिकॉर्ड",
  "No donations recorded yet": "अभी कोई रक्तदान दर्ज नहीं",
  "Add donations you've made — even from years ago — so volunteers can coordinate better.":
    "आपने जो रक्तदान किए हैं, उन्हें जोड़ें — सालों पुराने भी — ताकि स्वयंसेवक बेहतर तालमेल कर सकें।",
  "Event: {name}": "कार्यक्रम: {name}",
  "Reviewer note: {note}": "जाँचने वाले की टिप्पणी: {note}",
  Remove: "हटाएँ",
  "Remove this self-reported record?": "क्या खुद बताया गया यह रिकॉर्ड हटाना है?",
  "Add a whole blood, SDP or other apheresis donation.": "होल ब्लड, SDP या दूसरा एफ़ेरेसिस रक्तदान जोड़ें।",
  "Add your blood group first": "पहले अपना ब्लड ग्रुप जोड़ें",
  "Recording donations is part of the donor profile. {link} to continue.":
    "रक्तदान दर्ज करना डोनर प्रोफ़ाइल का हिस्सा है। आगे बढ़ने के लिए {link}।",
  "Complete your donor details": "अपनी डोनर जानकारी पूरी करें",

  // Donation summary (src/components/donations/donation-summary.tsx)
  "Last reported": "आखिरी बार बताया",
  None: "कोई नहीं",
  "Last verified": "आखिरी पुष्टि",
  "None yet": "अभी कोई नहीं",
  "SDP (platelets)": "SDP (प्लेटलेट्स)",
  "Verified whole blood": "पुष्टि वाले होल ब्लड",
  "Verified SDP": "पुष्टि वाले SDP",
  "Other verified apheresis": "दूसरे पुष्टि वाले एफ़ेरेसिस",
  "Awaiting verification": "पुष्टि बाकी",
  "Informational estimate only:": "सिर्फ़ जानकारी के लिए अंदाज़ा:",
  "based on a {days}-day minimum interval after your last reported whole blood donation, a blood centre might next see you from around {date}. Intervals differ by sex and circumstances, and the blood centre's screening always decides. No estimate is given for SDP.":
    "आपके आखिरी बताए गए होल ब्लड रक्तदान के बाद कम से कम {days} दिन के अंतर के हिसाब से, ब्लड बैंक आपको लगभग {date} से फिर बुला सकता है। यह अंतर पुरुष/महिला और हालात के हिसाब से अलग होता है, और फ़ैसला हमेशा ब्लड बैंक की जाँच से होता है। SDP के लिए कोई अंदाज़ा नहीं दिया जाता।",
  "Totals count verified records only. Self-reported records are shown separately until reviewed.":
    "कुल संख्या में सिर्फ़ पुष्टि वाले रिकॉर्ड गिने जाते हैं। खुद बताए गए रिकॉर्ड जाँच होने तक अलग दिखाए जाते हैं।",

  // Donation form (src/components/donations/donation-form.tsx)
  "Donation type": "रक्तदान का प्रकार",
  "Date of donation": "रक्तदान की तारीख",
  "Hospital, blood bank or donation centre": "अस्पताल, ब्लड बैंक या रक्तदान केंद्र",
  City: "शहर",
  District: "ज़िला",
  "Camp or event name (optional)": "कैंप या कार्यक्रम का नाम (ज़रूरी नहीं)",
  "This might be a duplicate": "यह दोबारा दर्ज हो सकता है",
  "You already have a record of the same type close to this date:": "इसी तारीख के आस-पास आपका इसी प्रकार का एक रिकॉर्ड पहले से है:",
  "If this is a separate donation, submit again to confirm.": "अगर यह अलग रक्तदान है, तो पक्का करने के लिए फिर से भेजें।",
  "This record will be marked {status} until an authorised volunteer verifies it. Recording a donation does not determine when you can donate again.":
    "जब तक कोई अधिकृत स्वयंसेवक पुष्टि नहीं करता, यह रिकॉर्ड {status} माना जाएगा। रक्तदान दर्ज करने से यह तय नहीं होता कि आप फिर कब रक्तदान कर सकते हैं।",
  "self-reported": "खुद बताया गया",
  "Yes, save it as a separate donation": "हाँ, इसे अलग रक्तदान के रूप में सेव करें",
  "Save donation": "रक्तदान सेव करें",

  // --- Notifications --------------------------------------------------------------
  "In-app updates about your profile, donations and requests. We never send bulk SMS or WhatsApp messages.":
    "आपकी प्रोफ़ाइल, रक्तदान और रिक्वेस्ट के बारे में ऐप में खबरें। हम कभी भी एक साथ ढेर सारे SMS या WhatsApp मैसेज नहीं भेजते।",
  "Mark all read": "सब पढ़ लिया",
  "Clear read": "पढ़ी हुई हटाएँ",
  "You're all caught up": "आपने सब देख लिया है",
  "Updates about verification, requests and your stories will appear here.": "पुष्टि, रिक्वेस्ट और आपकी कहानियों की खबरें यहाँ दिखेंगी।",
  "Unread: ": "नई: ",
  Open: "खोलें",
  "Mark read": "पढ़ लिया",

  // --- Profile ----------------------------------------------------------------------
  "My profile": "मेरी प्रोफ़ाइल",
  "Volunteers see you as “{name}”. Only admins see your full name and photo.":
    "स्वयंसेवकों को आप “{name}” के नाम से दिखते हैं। आपका पूरा नाम और फ़ोटो सिर्फ़ एडमिन देखते हैं।",
  "Donor #{code}": "डोनर #{code}",
  "Verified group": "पुष्टि वाला ग्रुप",
  "Self-declared": "खुद बताया",
  "Confirm your new email": "अपने नए ईमेल की पुष्टि करें",
  "Email verified": "ईमेल की पुष्टि हुई",
  "Email not verified yet": "ईमेल की पुष्टि अभी नहीं हुई",
  "We sent a link to {pendingEmail}. Your account keeps using {email} until you confirm.":
    "हमने {pendingEmail} पर एक लिंक भेजा है। जब तक आप पुष्टि नहीं करते, आपका खाता {email} से ही चलेगा।",
  "{email} was confirmed on {date}, so your donor profile is verified.":
    "{email} की पुष्टि {date} को हुई, इसलिए आपकी डोनर प्रोफ़ाइल की पुष्टि हो गई है।",
  "{email} was confirmed, so your donor profile is verified.": "{email} की पुष्टि हो गई, इसलिए आपकी डोनर प्रोफ़ाइल की पुष्टि हो गई है।",
  "Confirm your email to get your verified donor badge.": "पुष्टि वाला डोनर बैज पाने के लिए अपने ईमेल की पुष्टि करें।",
  "Resend verification email": "पुष्टि वाला ईमेल फिर से भेजें",
  "A correction to {group} is waiting for administrator review.": "{group} में बदलाव की रिक्वेस्ट एडमिन की जाँच का इंतज़ार कर रही है।",
  Details: "जानकारी",
  Mobile: "मोबाइल",
  "Same as mobile": "मोबाइल वाला ही",
  Experience: "अनुभव",
  "Age declaration": "उम्र की घोषणा",
  "Confirmed 18–65": "18–65 की पुष्टि की",
  "Not confirmed": "पुष्टि नहीं की",
  "Member since": "कब से सदस्य",
  Area: "इलाका",
  State: "राज्य",
  "City / town": "शहर / कस्बा",
  Locality: "मोहल्ला / इलाका",
  "PIN code": "पिन कोड",
  "Approximate map point": "नक्शे पर अंदाज़न जगह",
  "Added (~1 km)": "जोड़ा गया (~1 km)",
  "No area added yet. Volunteers can't match you to nearby requests without it.":
    "अभी कोई इलाका नहीं जोड़ा। इसके बिना स्वयंसेवक आपको पास की रिक्वेस्ट से नहीं जोड़ पाएँगे।",
  "My donations": "मेरे रक्तदान",
  "Donations logged": "दर्ज रक्तदान",
  "Verified by a volunteer": "स्वयंसेवक ने पुष्टि की",
  "Last donation": "आखिरी रक्तदान",
  "Log a donation": "रक्तदान दर्ज करें",
  "Shared {date}": "{date} को भेजी",
  "Tell people why you donate, with a photo if you like. An admin reviews it and you choose what is shown.":
    "लोगों को बताएँ कि आप रक्तदान क्यों करते हैं, चाहें तो फ़ोटो के साथ। एडमिन इसे जाँचते हैं और क्या दिखेगा, यह आप चुनते हैं।",
  "Privacy & availability": "प्राइवेसी और उपलब्धता",
  "Visible in volunteer directory": "स्वयंसेवकों की डोनर सूची में दिखें",
  "Volunteers may contact me": "स्वयंसेवक मुझसे संपर्क कर सकते हैं",
  "Currently open to contact": "अभी संपर्क के लिए उपलब्ध",
  "In-app request alerts": "ऐप में रिक्वेस्ट की सूचना",
  "Share verified donation summary": "पुष्टि वाले रक्तदान का सारांश दिखाएँ",
  "Volunteers see my first name": "स्वयंसेवक मेरा पहला नाम देखें",
  "Preferred contact": "संपर्क का पसंदीदा तरीका",

  // Edit profile (src/app/(member)/profile/edit/page.tsx)
  "Edit profile": "प्रोफ़ाइल बदलें",
  "Keep your details current so volunteers can respond quickly.": "अपनी जानकारी सही और नई रखें, ताकि स्वयंसेवक जल्दी मदद कर सकें।",
  "Profile photo": "प्रोफ़ाइल फ़ोटो",
  "Blood group": "ब्लड ग्रुप",
  "Personal details": "निजी जानकारी",
  "Never your street address.": "आपके घर का पूरा पता कभी नहीं।",

  // Profile forms (src/components/profile/profile-forms.tsx)
  "Full name": "पूरा नाम",
  "Display name for volunteers": "स्वयंसेवकों को दिखने वाला नाम",
  "Optional. What volunteers see. Leave blank to appear as a code like “Donor #3F2A”.":
    "ज़रूरी नहीं। यह नाम स्वयंसेवकों को दिखता है। खाली छोड़ेंगे तो आप “Donor #3F2A” जैसे कोड से दिखेंगे।",
  "Why I donate": "मैं रक्तदान क्यों करता/करती हूँ",
  "Optional, up to 280 characters. Shown on your profile and to volunteers and admins.":
    "ज़रूरी नहीं, 280 अक्षर तक। आपकी प्रोफ़ाइल पर और स्वयंसेवकों व एडमिन को दिखता है।",
  "Mobile number": "मोबाइल नंबर",
  "Private. Only shared with consent.": "प्राइवेट। सिर्फ़ आपकी सहमति से ही बताया जाता है।",
  "WhatsApp number (if different)": "WhatsApp नंबर (अगर अलग है)",
  "Donation experience": "रक्तदान का अनुभव",
  "Prefer not to say": "नहीं बताना चाहते",
  "Approximate number of past donations": "पहले लगभग कितनी बार रक्तदान किया",
  "I confirm I am between 18 and 65 years old": "मैं पुष्टि करता/करती हूँ कि मेरी उम्र 18 से 65 साल के बीच है",
  "A self-declaration. The blood centre confirms eligibility on the day.": "यह आपकी अपनी घोषणा है। आप रक्तदान कर सकते हैं या नहीं, यह उसी दिन ब्लड बैंक तय करता है।",
  "Save details": "जानकारी सेव करें",
  "Your blood group has been verified. If it's wrong, choose the correct group to request a review.":
    "आपके ब्लड ग्रुप की पुष्टि हो चुकी है। अगर यह गलत है, तो सही ग्रुप चुनें और दोबारा जाँच की रिक्वेस्ट भेजें।",
  "Choose your blood group. If you're unsure, check a previous donor card or lab report.":
    "अपना ब्लड ग्रुप चुनें। पक्का नहीं पता तो पुराना डोनर कार्ड या लैब रिपोर्ट देखें।",
  "Correction to {group} is waiting for review.": "{group} में बदलाव जाँच का इंतज़ार कर रहा है।",
  "Request correction": "बदलाव की रिक्वेस्ट भेजें",
  "Save blood group": "ब्लड ग्रुप सेव करें",
  "Locality / area": "मोहल्ला / इलाका",
  "Save area": "इलाका सेव करें",
  "Your profile photo": "आपकी प्रोफ़ाइल फ़ोटो",
  "Change photo": "फ़ोटो बदलें",
  "Add photo": "फ़ोटो जोड़ें",
  "Optional. Visible only to you and authorised volunteers. Location data is removed.":
    "ज़रूरी नहीं। सिर्फ़ आपको और अधिकृत स्वयंसेवकों को दिखती है। फ़ोटो से जगह की जानकारी हटा दी जाती है।",
  "Visible in the volunteer donor directory": "स्वयंसेवकों की डोनर सूची में दिखें",
  "Authorised volunteers see your display name, blood group and broad area. Never public.":
    "अधिकृत स्वयंसेवक आपका दिखने वाला नाम, ब्लड ग्रुप और मोटा-मोटा इलाका देखते हैं। यह कभी सबके लिए नहीं होता।",
  "Volunteers may contact me about verified requests": "जाँची हुई रिक्वेस्ट के लिए स्वयंसेवक मुझसे संपर्क कर सकते हैं",
  "Your number is revealed only for a verified request; every access is logged.":
    "आपका नंबर सिर्फ़ जाँची हुई रिक्वेस्ट के लिए दिखाया जाता है; हर बार देखने का रिकॉर्ड रखा जाता है।",
  "I'm currently open to contact": "अभी मुझसे संपर्क किया जा सकता है",
  "Turn off while travelling, unwell or after a recent donation.": "सफ़र में, तबीयत ठीक न हो या हाल ही में रक्तदान किया हो, तो इसे बंद कर दें।",
  "In-app alerts for verified requests near me": "मेरे पास की जाँची हुई रिक्वेस्ट की ऐप में सूचना",
  "Matching blood group and district only. No SMS or bulk messages.": "सिर्फ़ मेल खाते ब्लड ग्रुप और ज़िले की। कोई SMS या एक साथ ढेर सारे मैसेज नहीं।",
  "Share my verified donation summary with volunteers": "मेरे पुष्टि वाले रक्तदान का सारांश स्वयंसेवकों को दिखाएँ",
  "Last verified whole blood / SDP dates and counts.": "पुष्टि वाले आखिरी होल ब्लड / SDP की तारीखें और गिनती।",
  "Show my first name to volunteers": "स्वयंसेवकों को मेरा पहला नाम दिखाएँ",
  "Off: volunteers see only your display name, or a code like “Donor #3F2A”. Your full name and photo are only ever seen by Rakt Response admins.":
    "बंद होने पर: स्वयंसेवक सिर्फ़ आपका दिखने वाला नाम या “Donor #3F2A” जैसा कोड देखते हैं। आपका पूरा नाम और फ़ोटो सिर्फ़ Rakt Response के एडमिन ही देखते हैं।",
  "Directory and contact options become available once you add a blood group to your profile.":
    "प्रोफ़ाइल में ब्लड ग्रुप जोड़ने के बाद सूची और संपर्क वाले विकल्प मिलेंगे।",
  "Notify me about updates to my requests and records": "मेरी रिक्वेस्ट और रिकॉर्ड में बदलाव होने पर मुझे बताएँ",
  "In-app notifications only.": "सिर्फ़ ऐप में सूचना।",
  "Preferred contact method": "संपर्क का पसंदीदा तरीका",
  "How far could you travel?": "आप कितनी दूर तक जा सकते हैं?",
  "No preference": "कोई पसंद नहीं",
  "Up to {km} km": "{km} किमी तक",
  "Save my choices": "मेरी पसंद सेव करें",

  // --- Privacy & settings -------------------------------------------------------------
  "Every permission is separate and can be changed or withdrawn at any time.": "हर अनुमति अलग है और आप इसे कभी भी बदल या वापस ले सकते हैं।",
  "Consent & availability": "सहमति और उपलब्धता",
  "Directory visibility": "सूची में दिखना",
  "Contact by volunteers": "स्वयंसेवकों द्वारा संपर्क",
  "Request alerts": "रिक्वेस्ट की सूचना",
  "Privacy policy & terms": "प्राइवेसी नीति और शर्तें",
  "Consent history": "सहमति का रिकॉर्ड",
  "A record of the choices you've made.": "आपने जो-जो चुना, उसका रिकॉर्ड।",
  given: "दी गई",
  "withdrawn / not given": "वापस ली गई / नहीं दी गई",
  "No consent changes recorded yet.": "अभी तक सहमति में कोई बदलाव दर्ज नहीं।",
  "Signed in as": "इस ईमेल से साइन इन:",
  "Change password": "पासवर्ड बदलें",
  "Delete my account": "मेरा खाता हटाएँ",
  "Deletion requested on {date}. You've been removed from the directory and contact lists. An administrator will anonymise your account.":
    "{date} को खाता हटाने की रिक्वेस्ट भेजी गई। आपको डोनर सूची और संपर्क सूचियों से हटा दिया गया है। एडमिन आपके खाते से आपकी पहचान हटा देंगे।",
  "Cancel deletion request": "खाता हटाने की रिक्वेस्ट रद्द करें",
  "We'll immediately remove you from the donor directory and contact lists, then an administrator anonymises your profile, contact details, location and stories. Aggregated, non-identifying donation counts may remain.":
    "हम आपको तुरंत डोनर सूची और संपर्क सूचियों से हटा देंगे, फिर एडमिन आपकी प्रोफ़ाइल, संपर्क जानकारी, जगह और कहानियों से आपकी पहचान हटा देंगे। कुल रक्तदान की गिनती, जिससे आपकी पहचान नहीं होती, बनी रह सकती है।",
  "Request account deletion": "खाता हटाने की रिक्वेस्ट भेजें",
  "Request deletion of your Rakt Response account?": "क्या आप अपना Rakt Response खाता हटाने की रिक्वेस्ट भेजना चाहते हैं?",
  "Reason (optional)": "कारण (ज़रूरी नहीं)",
  "Type DELETE to confirm": "पक्का करने के लिए DELETE लिखें",

  // --- My stories (src/app/(member)/share-your-story/submissions/page.tsx) -----------------
  "Track review, change what is shown, request corrections or withdraw a story at any time.":
    "जाँच की स्थिति देखें, क्या दिखेगा यह बदलें, सुधार की रिक्वेस्ट भेजें या कभी भी कहानी वापस लें।",
  "Share a story": "कहानी बताएँ",
  "You haven't shared a story yet": "आपने अभी तक कोई कहानी नहीं बताई",
  "Your experience could encourage someone to donate for the first time.": "आपका अनुभव किसी को पहली बार रक्तदान करने का हौसला दे सकता है।",
  "submitted {date}": "{date} को भेजी",
  "View published story": "प्रकाशित कहानी देखें",
  "Withdrawn on {date}. It is not public.": "{date} को वापस ली गई। यह अब सबको नहीं दिखती।",
  Updates: "बदलाव",
  "Manage this story": "इस कहानी को संभालें",
  // Story event types, shown as "status changed" etc.
  submitted: "भेजी गई",
  "status changed": "स्थिति बदली",
  "verification updated": "पुष्टि बदली",
  "content edited": "लिखी बात बदली",
  "disclosure updated": "दिखने वाली जानकारी बदली",
  "photo updated": "फ़ोटो बदली",
  "consent updated": "सहमति बदली",
  "correction requested": "सुधार माँगा गया",
  withdrawn: "वापस ली गई",
  note: "टिप्पणी",
};

export default hi;
