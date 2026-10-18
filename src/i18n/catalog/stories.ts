import type { Catalog } from "./types";

/** English UI text → Hindi. Keep the English key exactly as written in the code. */
const hi: Catalog = {
  // --- /stories -------------------------------------------------------------------
  "Experiences shared by donors, patients' families, Rakt Mitras and camp organisers — published with consent.":
    "डोनर, मरीज़ों के परिजन, रक्त मित्र और कैंप आयोजक के अनुभव — उनकी सहमति से प्रकाशित।",
  "Stories that": "वो कहानियाँ जिन्होंने",
  "kept us going.": "हमें हिम्मत दी।",
  "Donors, families and Rakt Mitras — in their own words, published only with their consent.":
    "डोनर, परिवार और रक्त मित्र — उनके अपने शब्दों में, सिर्फ़ उनकी सहमति से प्रकाशित।",
  "Reviewed before publishing": "प्रकाशित करने से पहले जाँच",
  "Withdraw any time": "कभी भी वापस लें",
  "Story categories": "कहानियों की श्रेणियाँ",
  All: "सभी",
  "Stories are unavailable right now": "अभी कहानियाँ नहीं दिख पा रही हैं",
  "Please try again in a little while.": "कृपया थोड़ी देर बाद फिर कोशिश करें।",
  "No {category} published yet": "{category}: अभी तक कुछ प्रकाशित नहीं हुआ",
  "No stories published yet": "अभी तक कोई कहानी प्रकाशित नहीं हुई",
  "We never publish example or invented stories. Real experiences will appear here after review.":
    "हम कभी नमूने के लिए या बनाई हुई कहानियाँ प्रकाशित नहीं करते। सच्चे अनुभव जाँच के बाद यहाँ दिखेंगे।",
  "Share your experience": "अपना अनुभव बताएँ",

  // --- Story cards & trust labels (story-parts) ---------------------------------
  "Shared anonymously": "बिना नाम के साझा की गई",
  "Read story": "कहानी पढ़ें",
  "Read story: {title}": "कहानी पढ़ें: {title}",
  "What do the verification labels mean?": "जाँच वाले लेबल का क्या मतलब है?",
  "A label appears only after an authorised team member has done the check. Submitting a story never earns a label on its own.":
    "लेबल तभी दिखता है जब टीम का अधिकृत सदस्य जाँच कर लेता है। सिर्फ़ कहानी भेजने से कोई लेबल नहीं मिलता।",

  // --- /stories/[slug] ------------------------------------------------------------
  "Story not found": "कहानी नहीं मिली",
  "All stories": "सभी कहानियाँ",
  "Published {date}": "{date} को प्रकाशित",
  "Photo shared by the contributor": "कहानी भेजने वाले की साझा की गई फ़ोटो",
  "Camp details": "कैंप की जानकारी",
  "With {partners}": "{partners} के साथ",
  "{count} verified donors.": "{count} डोनर की पुष्टि हुई।",
  "{count} verified units collected.": "{count} यूनिट जमा होने की पुष्टि हुई।",
  "Verified {date}.": "{date} को पुष्टि हुई।",
  "This is a personal experience shared with consent. It is not medical advice, and it does not mean Rakt Response supplied blood or guaranteed an outcome.":
    "यह सहमति से साझा किया गया एक निजी अनुभव है। यह डॉक्टरी सलाह नहीं है, और इसका मतलब यह नहीं कि Rakt Response ने खून दिया या किसी नतीजे की गारंटी दी।",
  "Labels last reviewed {date}.": "लेबल की आखिरी जाँच {date} को हुई।",
  "Is something in this story inaccurate?": "क्या इस कहानी में कुछ गलत है?",
  "Let us know": "हमें बताएँ",

  // --- /share-your-story ------------------------------------------------------------
  "Share your experience as a donor, family member, Rakt Mitra or camp organiser. Nothing is published without review and your consent.":
    "डोनर, परिवार के सदस्य, रक्त मित्र या कैंप आयोजक के रूप में अपना अनुभव बताएँ। जाँच और आपकी सहमति के बिना कुछ भी प्रकाशित नहीं होता।",
  "Your story could be": "आपकी कहानी",
  "someone's first push.": "किसी की पहली हिम्मत बन सकती है।",
  "Donated? Needed blood? Served as a Rakt Mitra? Tell it your way — you choose what's shown.":
    "रक्तदान किया? खून की ज़रूरत पड़ी? रक्त मित्र के रूप में सेवा की? अपने तरीके से बताइए — क्या दिखेगा, यह आप तय करते हैं।",
  "Private until an administrator approves it": "एडमिन की मंज़ूरी तक निजी रहती है",
  "You choose your name, photo and details": "नाम, फ़ोटो और जानकारी आप चुनते हैं",
  "Withdraw or correct it any time": "कभी भी वापस लें या सुधार करवाएँ",
  "View stories you've shared": "अपनी भेजी हुई कहानियाँ देखें",
  "Sign in to share your story": "अपनी कहानी बताने के लिए साइन इन करें",
  "An account lets you see the review status, change what is shown, request corrections and withdraw your story whenever you like. You don't need to be a donor — family members and Rakt Mitras are welcome.":
    "खाते से आप जाँच की स्थिति देख सकते हैं, क्या दिखेगा यह बदल सकते हैं, सुधार के लिए कह सकते हैं और जब चाहें अपनी कहानी वापस ले सकते हैं। डोनर होना ज़रूरी नहीं — परिवार के सदस्यों और रक्त मित्रों का भी स्वागत है।",
  "Create a free account": "मुफ़्त खाता बनाएँ",
  "Please don't include a patient's full name, diagnosis, phone number, address or hospital documents. Stories are personal experiences and are never presented as medical advice.":
    "कृपया मरीज़ का पूरा नाम, बीमारी, फ़ोन नंबर, पता या अस्पताल के कागज़ न डालें। कहानियाँ निजी अनुभव हैं और इन्हें कभी डॉक्टरी सलाह के रूप में नहीं दिखाया जाता।",

  // --- Story form: steps & hints ------------------------------------------------------
  "About you": "आपके बारे में",
  "Your story": "आपकी कहानी",
  "Photo & permissions": "फ़ोटो और अनुमतियाँ",
  Preview: "झलक",
  "Step {step} of {total}: {title}": "चरण {step} / {total}: {title}",
  "What kind of story is this?": "यह किस तरह की कहानी है?",
  "Why you donate, what it was like, what you'd tell a first-time donor.":
    "आप रक्तदान क्यों करते हैं, कैसा लगा, और पहली बार रक्तदान करने वाले से आप क्या कहेंगे।",
  "When blood was needed for someone close to you and how the search went. No patient name or diagnosis needed.":
    "जब आपके किसी अपने को खून की ज़रूरत पड़ी और खोज कैसे हुई। मरीज़ का नाम या बीमारी बताने की ज़रूरत नहीं।",
  "Your own experience of needing blood, only as much as you're comfortable sharing.":
    "खून की ज़रूरत का आपका अपना अनुभव, उतना ही जितना आप बताना चाहें।",
  "Coordinating requests, supporting donors and families, lessons learned.":
    "रिक्वेस्ट संभालना, डोनर और परिवारों की मदद करना, और जो सीखा।",
  "A donation camp you helped organise: highlights, partners and learnings.":
    "कोई रक्तदान कैंप जिसे आयोजित करने में आपने मदद की: खास बातें, साथी और सीख।",

  // --- Story form: fields -------------------------------------------------------------
  "Your name (private)": "आपका नाम (निजी)",
  "Only reviewers see this.": "इसे सिर्फ़ जाँच करने वाले देखते हैं।",
  "Name to show publicly, if you allow it": "सबको दिखने वाला नाम, अगर आप अनुमति दें",
  "For example your first name or initials.": "जैसे आपका पहला नाम या नाम के पहले अक्षर।",
  "Email for follow-up (private)": "संपर्क के लिए ईमेल (निजी)",
  "Phone for follow-up (private)": "संपर्क के लिए फ़ोन (निजी)",
  "City or broad area": "शहर या इलाका",
  "Story title": "कहानी का शीर्षक",
  "Write in your own words. Please avoid patient names, diagnoses, phone numbers or hospital documents.":
    "अपने शब्दों में लिखें। कृपया मरीज़ का नाम, बीमारी, फ़ोन नंबर या अस्पताल के कागज़ न डालें।",
  "When (approximate)": "कब (लगभग)",
  "e.g. March 2026": "जैसे मार्च 2026",
  "Donation type, if relevant": "रक्तदान का प्रकार, अगर लागू हो",
  "Not applicable": "लागू नहीं",
  "Blood group (optional)": "ब्लड ग्रुप (ज़रूरी नहीं)",
  "Prefer not to say": "नहीं बताना चाहते",
  "Which camp? (optional)": "कौन-सा कैंप? (ज़रूरी नहीं)",
  "Not listed": "सूची में नहीं है",
  "Photo (optional)": "फ़ोटो (ज़रूरी नहीं)",
  "Selected photo preview": "चुनी गई फ़ोटो की झलक",
  "Remove photo": "फ़ोटो हटाएँ",
  "Preparing photo…": "फ़ोटो तैयार हो रही है…",
  "Add a photo": "फ़ोटो जोड़ें",
  "JPEG, PNG or WebP. Location data is removed. Only you and reviewers see it unless you allow publication.":
    "JPEG, PNG या WebP। लोकेशन की जानकारी हटा दी जाती है। जब तक आप प्रकाशित करने की अनुमति न दें, इसे सिर्फ़ आप और जाँच करने वाले देखते हैं।",
  "That photo is very large. Please choose one under 15 MB.": "यह फ़ोटो बहुत बड़ी है। कृपया 15 MB से छोटी फ़ोटो चुनें।",
  "The photo is still too large after resizing.": "छोटा करने के बाद भी फ़ोटो बहुत बड़ी है।",
  "We couldn't use that photo. Try another image.": "यह फ़ोटो इस्तेमाल नहीं हो पाई। कोई दूसरी फ़ोटो आज़माएँ।",
  "Please choose an image file.": "कृपया कोई फ़ोटो फ़ाइल चुनें।",
  "Your browser could not process this photo.": "आपका ब्राउज़र यह फ़ोटो तैयार नहीं कर पाया।",
  "Details for our reviewers only (optional)": "सिर्फ़ जाँच करने वालों के लिए जानकारी (ज़रूरी नहीं)",
  "For example, the approximate date and hospital, or a request reference. Never shown publicly. No medical documents please.":
    "जैसे लगभग तारीख और अस्पताल, या रिक्वेस्ट का नंबर। यह कभी सबको नहीं दिखाया जाता। कृपया डॉक्टरी कागज़ न डालें।",

  // --- Story form: consent ------------------------------------------------------------
  "I consent to Rakt Response publishing this story after review": "मैं सहमति देता/देती हूँ कि Rakt Response जाँच के बाद यह कहानी प्रकाशित करे",
  "An administrator reviews every story first and may tidy formatting without changing your meaning.":
    "एडमिन पहले हर कहानी की जाँच करते हैं और आपकी बात का मतलब बदले बिना लिखावट को ठीक कर सकते हैं।",
  "Show my public display name": "मेरा दिखने वाला नाम दिखाएँ",
  "Leave unticked to publish anonymously.": "बिना नाम के प्रकाशित करने के लिए इसे खाली छोड़ें।",
  "Show my photo publicly": "मेरी फ़ोटो सबको दिखाएँ",
  "Only after an administrator approves it.": "सिर्फ़ एडमिन की मंज़ूरी के बाद।",
  "Add a photo above to enable this.": "इसे चालू करने के लिए ऊपर फ़ोटो जोड़ें।",
  "Show my blood group": "मेरा ब्लड ग्रुप दिखाएँ",
  "Optional personal detail on the published story.": "प्रकाशित कहानी पर एक निजी जानकारी, ज़रूरी नहीं।",
  "You may contact me to verify details": "जानकारी की पुष्टि के लिए आप मुझसे संपर्क कर सकते हैं",
  "Helps us add trust labels such as Experience Reviewed.": "इससे हम 'अनुभव की जाँच हुई' जैसे भरोसे वाले लेबल जोड़ पाते हैं।",
  "I have the right to share this story and photo": "मुझे यह कहानी और फ़ोटो साझा करने का अधिकार है",
  "Including permission from anyone else who appears in the photo or is identifiable in the story.":
    "इसमें उन सभी लोगों की अनुमति भी शामिल है जो फ़ोटो में दिखते हैं या कहानी से पहचाने जा सकते हैं।",

  // --- Story form: preview & submit ---------------------------------------------------
  "This is how your story would appear if approved and published:": "मंज़ूरी मिलने और प्रकाशित होने पर आपकी कहानी ऐसी दिखेगी:",
  "No public photo": "कोई सार्वजनिक फ़ोटो नहीं",
  "Your title": "आपका शीर्षक",
  "Private and never published: your full name, follow-up contact, reviewer notes.":
    "निजी, कभी प्रकाशित नहीं होगा: आपका पूरा नाम, संपर्क की जानकारी, जाँच करने वालों के नोट्स।",
  "Private and never published: your full name, follow-up contact, reviewer notes and your photo.":
    "निजी, कभी प्रकाशित नहीं होगा: आपका पूरा नाम, संपर्क की जानकारी, जाँच करने वालों के नोट्स और आपकी फ़ोटो।",
  "Submitting…": "भेजा जा रहा है…",
  "Submit for review": "जाँच के लिए भेजें",
  "Thank you for sharing your story": "अपनी कहानी बताने के लिए धन्यवाद",
  "It is private until an administrator reviews it. We may contact you to check details. Nothing is published without your consent, and you can withdraw at any time.":
    "जब तक एडमिन इसकी जाँच नहीं करते, यह निजी रहेगी। जानकारी जाँचने के लिए हम आपसे संपर्क कर सकते हैं। आपकी सहमति के बिना कुछ भी प्रकाशित नहीं होता, और आप इसे कभी भी वापस ले सकते हैं।",
  "View my stories": "मेरी कहानियाँ देखें",

  // --- My stories: consent, correction, withdrawal ------------------------------------
  "What may be shown": "क्या दिखाया जा सकता है",
  "My display name": "मेरा दिखने वाला नाम",
  "My photo": "मेरी फ़ोटो",
  "My blood group": "मेरा ब्लड ग्रुप",
  "Reviewers may contact me": "जाँच करने वाले मुझसे संपर्क कर सकते हैं",
  "Save choices": "चुनाव सेव करें",
  "Request a correction": "सुधार के लिए कहें",
  "What should be changed?": "क्या बदलना है?",
  "Send correction request": "सुधार की रिक्वेस्ट भेजें",
  "Withdraw this story? It will be removed from the website immediately.": "यह कहानी वापस लें? इसे वेबसाइट से तुरंत हटा दिया जाएगा।",
  "Withdraw this story": "यह कहानी वापस लें",
  "Reason (optional)": "कारण (ज़रूरी नहीं)",
  "Withdrawing…": "वापस ली जा रही है…",
  "Withdraw story": "कहानी वापस लें",

  // --- Story messages (src/actions/stories.ts, storySchema) ---------------------------
  "Please sign in to share your story.": "अपनी कहानी बताने के लिए कृपया साइन इन करें।",
  "Your story could not be read. Please try again.": "आपकी कहानी पढ़ी नहीं जा सकी। कृपया फिर कोशिश करें।",
  "Invalid camp selection.": "कैंप सही से नहीं चुना गया।",
  "We couldn't upload your photo right now. You can submit without it and add one later by contacting us.":
    "अभी आपकी फ़ोटो अपलोड नहीं हो पाई। आप इसके बिना भेज सकते हैं और बाद में हमसे संपर्क करके फ़ोटो जोड़ सकते हैं।",
  "We could not submit your story. Please try again.": "आपकी कहानी भेजी नहीं जा सकी। कृपया फिर कोशिश करें।",
  "Thank you for sharing. Our team will review your story before anything is published.":
    "बताने के लिए धन्यवाद। कुछ भी प्रकाशित होने से पहले हमारी टीम आपकी कहानी की जाँच करेगी।",
  "Invalid story.": "कहानी सही नहीं है।",
  "Your story has been withdrawn and is no longer public.": "आपकी कहानी वापस ले ली गई है और अब सबको नहीं दिखती।",
  "Please describe the correction.": "कृपया बताएँ कि क्या सुधार करना है।",
  "Please describe the correction": "कृपया बताएँ कि क्या सुधार करना है",
  "Thanks — a reviewer will look at your correction request.": "धन्यवाद — जाँच करने वाले आपकी सुधार रिक्वेस्ट देखेंगे।",
  "Your choices were saved. Anything you turned off is hidden immediately.":
    "आपके चुनाव सेव हो गए। जो भी आपने बंद किया है, वह तुरंत छिप जाता है।",
  "Choose the kind of story": "कहानी का प्रकार चुनें",
  "Consent to publish is required to submit a story": "कहानी भेजने के लिए प्रकाशित करने की सहमति ज़रूरी है",
  "Keep the title under 120 characters": "शीर्षक 120 अक्षरों से कम रखें",
  "Please confirm you have the right to share this content": "कृपया पुष्टि करें कि आपको यह साझा करने का अधिकार है",
  "Please keep the story under 6000 characters": "कृपया कहानी 6000 अक्षरों से कम रखें",
  "Please write at least 80 characters": "कृपया कम से कम 80 अक्षर लिखें",
  "Share an email or phone so a reviewer can follow up privately": "ईमेल या फ़ोन दें ताकि जाँच करने वाले आपसे निजी तौर पर संपर्क कर सकें",
};

export default hi;
