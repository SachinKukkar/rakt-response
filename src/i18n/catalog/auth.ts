import type { Catalog } from "./types";

/** Sign in, password reset, email check, donor registration wizard, location pickers. */
const hi: Catalog = {
  // --- Sign in (src/app/(auth)/login) ------------------------------------------
  "That link has expired or was already used. Please sign in or request a new link.":
    "यह लिंक पुराना हो गया है या पहले ही इस्तेमाल हो चुका है। कृपया साइन इन करें या नया लिंक मँगाएँ।",
  "Your email is confirmed. Please sign in to continue.": "आपके ईमेल की पुष्टि हो गई है। आगे बढ़ने के लिए साइन इन करें।",
  "You have signed out.": "आप साइन आउट हो गए हैं।",
  "Welcome back": "फिर से स्वागत है",
  "Sign in to manage your donor profile, donation history and requests.":
    "अपनी डोनर प्रोफ़ाइल, रक्तदान का रिकॉर्ड और रिक्वेस्ट देखने के लिए साइन इन करें।",
  "New to Rakt Response?": "Rakt Response पर नए हैं?",
  Password: "पासवर्ड",
  "Hide password": "पासवर्ड छिपाएँ",
  "Show password": "पासवर्ड दिखाएँ",
  "Forgot password?": "पासवर्ड भूल गए?",
  "Can't find it?": "ईमेल नहीं मिला?",
  "Resend the verification email": "पुष्टि वाला ईमेल फिर से भेजें",
  "Signing in…": "साइन इन हो रहा है…",
  "The Rakt Response database is not connected in this environment, so accounts cannot be created or used yet. See the README for Supabase setup.":
    "यहाँ Rakt Response का डेटाबेस जुड़ा नहीं है, इसलिए अभी खाता न बन सकता है, न इस्तेमाल हो सकता है। Supabase सेटअप के लिए README देखें।",

  // --- Forgot / reset password -------------------------------------------------
  "Reset your password": "नया पासवर्ड बनाएँ",
  "Forgot your password?": "पासवर्ड भूल गए?",
  "Enter the email you registered with and we'll send you a reset link.":
    "जिस ईमेल से आपने रजिस्टर किया था, वह लिखें। हम आपको नया पासवर्ड बनाने का लिंक भेजेंगे।",
  "Back to sign in": "साइन इन पर वापस जाएँ",
  "Reset links must be opened on the same phone or browser where you requested them. Request a new link below and open it on this device.":
    "पासवर्ड वाला लिंक उसी फ़ोन या ब्राउज़र में खोलें जहाँ से आपने उसे मँगाया था। नीचे से नया लिंक मँगाएँ और उसे इसी फ़ोन में खोलें।",
  "We'll email you a secure link to choose a new password.": "हम आपको ईमेल पर एक सुरक्षित लिंक भेजेंगे, जिससे आप नया पासवर्ड बना सकें।",
  "Send reset link": "लिंक भेजें",
  "Choose a new password": "नया पासवर्ड बनाएँ",
  "Link expired": "लिंक का समय खत्म",
  "Password reset links can only be used once and expire after a short time.":
    "पासवर्ड वाला लिंक सिर्फ़ एक बार चलता है और थोड़ी देर बाद बंद हो जाता है।",
  "Request a new reset link": "नया लिंक मँगाएँ",
  "You're signed in from your reset link. Pick a new password below.": "आप लिंक से साइन इन हो गए हैं। नीचे नया पासवर्ड बनाएँ।",
  "New password": "नया पासवर्ड",
  "At least 8 characters, with a letter and a number.": "कम से कम 8 अक्षर, जिनमें कम से कम एक अंग्रेज़ी अक्षर और एक अंक (0-9) हो।",
  "Confirm new password": "नया पासवर्ड फिर से लिखें",
  "Updating…": "बदला जा रहा है…",
  "Update password": "पासवर्ड बदलें",

  // --- Confirm email -----------------------------------------------------------
  "Confirm your email": "अपने ईमेल की पुष्टि करें",
  "Check your inbox": "अपना ईमेल देखें",
  "Go to sign in": "साइन इन पर जाएँ",
  "We sent a confirmation link to the email address you registered with. Open it on this phone or any device to activate your account.":
    "जिस ईमेल से आपने रजिस्टर किया, उस पर हमने पुष्टि का लिंक भेजा है। अपना खाता चालू करने के लिए उसे इस फ़ोन या किसी भी फ़ोन/कंप्यूटर पर खोलें।",
  "Your profile stays private until you confirm your email. Emails can take a few minutes — please also check spam or promotions folders.":
    "जब तक आप ईमेल की पुष्टि नहीं करते, आपकी प्रोफ़ाइल किसी को नहीं दिखती। ईमेल आने में कुछ मिनट लग सकते हैं — Spam या Promotions फ़ोल्डर भी देखें।",
  "Didn't get the email? Enter your address to resend it": "ईमेल नहीं मिला? अपना ईमेल लिखें, हम फिर से भेज देंगे",
  "Resend verification email": "पुष्टि वाला ईमेल फिर से भेजें",

  // --- Register page -------------------------------------------------------------
  "Register as a voluntary blood donor with Rakt Response in a few short steps.":
    "कुछ आसान चरणों में Rakt Response पर स्वैच्छिक रक्तदाता (डोनर) के रूप में रजिस्टर करें।",
  "Already registered?": "पहले से रजिस्टर हैं?",

  // --- Registration wizard: steps ---------------------------------------------------
  "Create your account": "अपना खाता बनाएँ",
  "Your login details stay private.": "आपकी लॉगिन जानकारी किसी को नहीं दिखती।",
  "About you as a donor": "डोनर के रूप में आपकी जानकारी",
  "Only what's needed to coordinate safely.": "सिर्फ़ उतनी जानकारी जितनी सुरक्षित तालमेल के लिए ज़रूरी है।",
  "Where are you based?": "आप कहाँ रहते हैं?",
  "Area details only — never your exact address.": "सिर्फ़ इलाके की जानकारी — आपका पूरा पता कभी नहीं।",
  "Self-reported until a volunteer verifies it.": "जब तक स्वयंसेवक पुष्टि न करे, यह आपकी बताई जानकारी मानी जाएगी।",
  "Review & confirm": "जाँचें और पक्का करें",
  "Check everything before you register.": "रजिस्टर करने से पहले सब कुछ एक बार देख लें।",
  "Step {current} of {total}": "{total} में से चरण {current}",
  "Registration progress": "रजिस्ट्रेशन कहाँ तक हुआ",
  completed: "पूरा हुआ",
  current: "अभी यह चरण",
  Register: "रजिस्टर करें",
  "Creating your account…": "आपका खाता बन रहा है…",

  // Account step
  "Full name": "पूरा नाम",
  "Used to sign in and confirm your account.": "साइन इन करने और खाते की पुष्टि के लिए।",
  "Confirm password": "पासवर्ड फिर से लिखें",
  "I have read and accept the": "मैंने ये पढ़ ली हैं और मैं इन्हें मानता/मानती हूँ:",
  "privacy policy": "प्राइवेसी नीति",
  and: "और",
  "terms of use": "उपयोग की शर्तें",
  "Directory visibility and contact permissions are separate choices you'll make later.":
    "डोनर सूची में दिखना और आपसे संपर्क की अनुमति — ये अलग फ़ैसले हैं, जो आप बाद में करेंगे।",

  // Donor step
  "Why are you joining?": "आप क्यों जुड़ रहे हैं?",
  "I want to register as a voluntary donor": "मैं स्वैच्छिक डोनर के रूप में रजिस्टर करना चाहता/चाहती हूँ",
  "I want to request blood or share a story": "मुझे खून के लिए रिक्वेस्ट करनी है या कहानी बतानी है",
  "You can become a donor later.": "आप बाद में भी डोनर बन सकते हैं।",
  "Blood group": "ब्लड ग्रुप",
  "If you are unsure, you can find it on a previous donor card or blood test report. A blood centre will always test again before any transfusion.":
    "अगर पक्का पता नहीं है, तो पुराने डोनर कार्ड या खून की जाँच की रिपोर्ट में देखें। खून चढ़ाने से पहले ब्लड बैंक हमेशा दोबारा जाँच करता है।",
  "I confirm I am between 18 and 65 years old": "मैं पक्का करता/करती हूँ कि मेरी उम्र 18 से 65 साल के बीच है",
  "We don't ask for your date of birth. Final eligibility is always decided at the blood centre.":
    "हम आपकी जन्म तारीख नहीं पूछते। आप रक्तदान कर सकते हैं या नहीं, इसका आखिरी फ़ैसला हमेशा ब्लड बैंक में होता है।",
  "Donation experience": "रक्तदान का अनुभव",
  "Preferred display name": "दिखने वाला नाम",
  "Shown to volunteers instead of your full name. Optional.": "स्वयंसेवकों को आपके पूरे नाम की जगह यह नाम दिखेगा। ज़रूरी नहीं।",
  "Mobile number": "मोबाइल नंबर",
  "Kept private. Shared with an authorised volunteer only if you allow contact.":
    "यह छिपा रहता है। आप संपर्क की अनुमति देंगे, तभी यह अधिकृत स्वयंसेवक को दिखेगा।",
  "Preferred contact method": "संपर्क का पसंदीदा तरीका",
  "You can add a profile photo later from your profile. We don't ask for medical history.":
    "प्रोफ़ाइल फ़ोटो आप बाद में अपनी प्रोफ़ाइल से लगा सकते हैं। हम आपकी बीमारियों का इतिहास नहीं पूछते।",

  // Location step
  "Optional for members who are not registering as donors.": "जो डोनर के रूप में रजिस्टर नहीं कर रहे, उनके लिए यह ज़रूरी नहीं।",
  "Locality / area": "मोहल्ला / इलाका",
  "Neighbourhood only — not your street address.": "सिर्फ़ मोहल्ला या इलाका — गली या मकान का पता नहीं।",
  "PIN code": "पिन कोड",
  "How far could you travel to donate? (optional)": "रक्तदान के लिए आप कितनी दूर तक जा सकते हैं? (ज़रूरी नहीं)",
  "No preference": "कोई भी दूरी",
  "Up to {km} km": "{km} किमी तक",
  "Choose your state": "अपना राज्य चुनें",
  "Enter your district": "अपना ज़िला लिखें",
  "Enter your city or town": "अपना शहर या कस्बा लिखें",

  // History step
  "I haven't donated before": "मैंने पहले रक्तदान नहीं किया",
  "I have donated before": "मैंने पहले रक्तदान किया है",
  "Roughly how many times have you donated? (optional)": "आपने लगभग कितनी बार रक्तदान किया है? (ज़रूरी नहीं)",
  "Add the donations you remember. Whole blood and SDP are recorded separately. Entries stay marked as self-reported until verified.":
    "जितने रक्तदान याद हैं, वे जोड़ें। होल ब्लड और SDP अलग-अलग दर्ज होते हैं। पुष्टि होने तक ये आपकी बताई जानकारी के रूप में दिखेंगे।",
  "Donation {number}": "रक्तदान {number}",
  "Remove donation {number}": "रक्तदान {number} हटाएँ",
  Type: "प्रकार",
  "Date (approximate is fine)": "तारीख (अंदाज़े से भी चलेगी)",
  "Hospital / blood bank / centre": "अस्पताल / ब्लड बैंक / सेंटर",
  City: "शहर",
  District: "ज़िला",
  "Camp / event name (optional)": "कैंप / कार्यक्रम का नाम (ज़रूरी नहीं)",
  "This is within a week of another {type} entry. Please check it isn't the same donation entered twice.":
    "यह एक और {type} वाली एंट्री से एक हफ़्ते के अंदर है। देख लें कि एक ही रक्तदान दो बार तो नहीं लिखा गया।",
  "Add another donation": "एक और रक्तदान जोड़ें",

  // Review step
  "Volunteers can reach me when my blood group is needed nearby": "जब पास में मेरे ब्लड ग्रुप की ज़रूरत हो, तो स्वयंसेवक मुझसे संपर्क कर सकते हैं",
  "Only Rakt Response volunteers and admins see your name, blood group and area. Never the public or other donors. Your number is shown only for a verified request, and every view is logged. Change this any time in Privacy & settings.":
    "आपका नाम, ब्लड ग्रुप और इलाका सिर्फ़ Rakt Response के स्वयंसेवक और एडमिन देखते हैं। आम लोग या दूसरे डोनर कभी नहीं। आपका नंबर सिर्फ़ जाँची गई रिक्वेस्ट के लिए दिखता है, और हर बार देखने का रिकॉर्ड रहता है। इसे कभी भी प्राइवेसी और सेटिंग्स में बदल सकते हैं।",
  Name: "नाम",
  "Donor details": "डोनर की जानकारी",
  "Registering as": "किस रूप में जुड़ रहे हैं",
  "Voluntary donor": "स्वैच्छिक डोनर",
  "Member (requests and stories)": "सदस्य (रिक्वेस्ट और कहानियाँ)",
  "Display name": "दिखने वाला नाम",
  Mobile: "मोबाइल",
  "Preferred contact": "संपर्क का तरीका",
  Area: "इलाका",
  State: "राज्य",
  "District / city": "ज़िला / शहर",
  "Locality / PIN": "इलाका / पिन",
  "Approximate map location": "नक्शे पर अंदाज़न जगह",
  "Added (rounded to ~1 km)": "जोड़ी गई (लगभग 1 किमी तक अंदाज़न)",
  "Donation history (self-reported)": "रक्तदान का रिकॉर्ड (आपका बताया हुआ)",
  History: "रिकॉर्ड",
  "No previous donations": "पहले कोई रक्तदान नहीं",
  "Registering does not make you medically eligible to donate. Blood centres screen every donor at the time of donation.":
    "रजिस्टर करने से आप डॉक्टरी तौर पर रक्तदान के योग्य नहीं हो जाते। ब्लड बैंक रक्तदान के समय हर डोनर की जाँच करता है।",

  // --- Location pickers & search box --------------------------------------------
  "State / union territory": "राज्य / केंद्र शासित प्रदेश",
  "Select…": "चुनें…",
  "Choose your state first.": "पहले अपना राज्य चुनें।",
  "Search district": "ज़िला खोजें",
  "Choose a state first": "पहले राज्य चुनें",
  "Not listed? Type the name": "सूची में नहीं है? नाम लिख दें",
  "City / town / village": "शहर / कस्बा / गाँव",
  "Search city, town or village": "शहर, कस्बा या गाँव खोजें",
  "Choose a district first": "पहले ज़िला चुनें",
  "Use “{value}”": "“{value}” चुनें",
  "Loading…": "लोड हो रहा है…",
  "No matches": "कुछ नहीं मिला",
  "Any blood group": "कोई भी ब्लड ग्रुप",

  // --- Approximate location (map) ---------------------------------------------------
  "Loading map": "नक्शा लोड हो रहा है",
  "Approximate location (optional)": "अंदाज़न जगह (ज़रूरी नहीं)",
  "Helps volunteers find nearby donors. We store it rounded to about 1 km and never show it publicly.":
    "इससे स्वयंसेवक पास के डोनर ढूँढ पाते हैं। हम इसे लगभग 1 किमी तक अंदाज़न रखते हैं और कभी सबको नहीं दिखाते।",
  "Approximately {lat}, {lng}": "लगभग {lat}, {lng}",
  "Remove approximate location": "अंदाज़न जगह हटाएँ",
  "Locating…": "जगह ढूँढी जा रही है…",
  "Use my approximate location": "मेरी अंदाज़न जगह लें",
  "Hide map": "नक्शा छिपाएँ",
  "Pick on a map": "नक्शे पर चुनें",
  "Location is not available on this device. You can skip this step.": "इस फ़ोन पर जगह (लोकेशन) नहीं मिल सकती। आप यह छोड़ सकते हैं।",
  "We couldn't get your location. That's fine — your area details above are enough.":
    "आपकी जगह नहीं मिल पाई। कोई बात नहीं — ऊपर दी गई इलाके की जानकारी काफ़ी है।",
};

export default hi;
