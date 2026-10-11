import type { Catalog } from "./types";

/** English UI text → Hindi. Keep the English key exactly as written in the code. */
const hi: Catalog = {
  // --- Homepage: hero (src/app/(site)/page.tsx) ------------------------------------
  "Voluntary blood donors": "स्वैच्छिक रक्तदाता",
  "Every Donor Matters.": "हर डोनर मायने रखता है।",
  "Every Response": "हर जवाब",
  "Can Save a Life.": "एक जान बचा सकता है।",
  "Private by default": "आपकी जानकारी निजी रहती है",
  "Requests verified by volunteers": "स्वयंसेवक रिक्वेस्ट की जाँच करते हैं",
  "Free & voluntary": "मुफ़्त और स्वैच्छिक",
  "Bombay blood group (Oh)": "बॉम्बे ब्लड ग्रुप (Oh)",

  // --- Homepage: how it works ---------------------------------------------------------
  "How Rakt Response works": "Rakt Response कैसे काम करता है",
  "Simple steps, with you in control of your information.": "आसान कदम, और आपकी जानकारी पर आपका पूरा नियंत्रण।",
  "Step {n}": "कदम {n}",
  "Register as a voluntary donor": "स्वैच्छिक डोनर के रूप में रजिस्टर करें",
  "A short, private sign-up. No medical records needed.": "छोटा और निजी रजिस्ट्रेशन। कोई मेडिकल रिकॉर्ड नहीं चाहिए।",
  "Complete your donor profile": "अपनी डोनर प्रोफ़ाइल पूरी करें",
  "Blood group, broad area and how you'd like to be reached.": "ब्लड ग्रुप, आपका इलाका, और आपसे कैसे संपर्क किया जाए।",
  "Record your history and preferences": "अपना रिकॉर्ड और अपनी पसंद दर्ज करें",
  "Add past whole blood and SDP donations — marked self-reported until verified.":
    "पहले किए गए होल ब्लड और SDP रक्तदान जोड़ें — पुष्टि होने तक ये \"खुद बताया गया\" दिखेंगे।",
  "Receive relevant requests": "आपके काम की रिक्वेस्ट पाएँ",
  "Only if you opt in: verified requests for your blood group near you.":
    "सिर्फ़ अगर आप चाहें: आपके आस-पास, आपके ब्लड ग्रुप की जाँची गई रिक्वेस्ट।",
  "Connect through authorised volunteers": "अधिकृत स्वयंसेवकों के ज़रिए जुड़ें",
  "Contact happens only with your consent, through approved workflows.": "संपर्क सिर्फ़ आपकी सहमति से और तय तरीके से ही होता है।",
  "Update your history after donating": "रक्तदान के बाद अपना रिकॉर्ड अपडेट करें",
  "Keep your record current so volunteers respond faster next time.":
    "अपना रिकॉर्ड ताज़ा रखें, ताकि अगली बार स्वयंसेवक जल्दी मदद कर सकें।",

  // --- Homepage: why it matters -------------------------------------------------------
  "Why blood donation matters": "रक्तदान क्यों ज़रूरी है",
  "Blood and its components cannot be manufactured. Hospitals rely on voluntary donors.":
    "खून और उसके हिस्से फ़ैक्ट्री में नहीं बनाए जा सकते। अस्पताल स्वैच्छिक डोनरों पर निर्भर हैं।",
  "Learn more": "और जानें",
  "Emergency care": "इमरजेंसी इलाज",
  "Accidents and trauma can need blood quickly, before a patient is stable.":
    "दुर्घटना और गंभीर चोट में मरीज़ के संभलने से पहले ही जल्दी खून की ज़रूरत पड़ सकती है।",
  Surgery: "ऑपरेशन",
  "Many operations rely on blood being available in case it is needed.":
    "कई ऑपरेशन इस बात पर निर्भर होते हैं कि ज़रूरत पड़ने पर खून मिल सके।",
  "Maternal care": "माँ और प्रसव की देखभाल",
  "Heavy bleeding around childbirth can require urgent transfusion.": "प्रसव के समय ज़्यादा खून बहने पर तुरंत खून चढ़ाना पड़ सकता है।",
  "Cancer treatment": "कैंसर का इलाज",
  "Chemotherapy can lower blood counts; platelets are often needed.": "कीमोथेरेपी से ब्लड काउंट कम हो सकता है; अक्सर प्लेटलेट्स की ज़रूरत पड़ती है।",
  "Ongoing conditions": "लंबी बीमारियाँ",
  "People with conditions such as thalassaemia may need regular transfusions.":
    "थैलेसीमिया जैसी बीमारियों वाले लोगों को नियमित रूप से खून चढ़वाना पड़ सकता है।",
  "Whether, when and what to transfuse is always decided by the treating doctors and licensed blood banks.":
    "खून चढ़ाना है या नहीं, कब और कौन-सा, यह हमेशा इलाज करने वाले डॉक्टर और लाइसेंस वाले ब्लड बैंक तय करते हैं।",
  "Learn why donation matters": "जानें रक्तदान क्यों ज़रूरी है",

  // --- Homepage: types of donation ----------------------------------------------------
  "Types of donation": "रक्तदान के प्रकार",
  "Different procedures, different checks and intervals — they are not interchangeable.":
    "अलग तरीके, अलग जाँच और अलग अंतराल — एक की जगह दूसरा नहीं चल सकता।",
  "Most common": "सबसे आम",
  "A single donation collected in a bag, usually in about 10–15 minutes. The blood centre can separate it into red cells, plasma and platelets.":
    "एक बार में एक थैली में खून लिया जाता है, आमतौर पर करीब 10–15 मिनट में। ब्लड बैंक इसे रेड सेल, प्लाज़्मा और प्लेटलेट्स में अलग कर सकता है।",
  Platelets: "प्लेटलेट्स",
  "SDP — single donor platelets": "SDP — एक डोनर से प्लेटलेट्स",
  "A machine collects platelets and returns the rest of your blood. Sessions take longer and need extra checks at an apheresis centre. Often requested for cancer and dengue care.":
    "मशीन प्लेटलेट्स ले लेती है और बाकी खून आपको वापस कर देती है। इसमें ज़्यादा समय लगता है और एफ़ेरेसिस सेंटर पर अतिरिक्त जाँच होती है। कैंसर और डेंगू के इलाज के लिए अक्सर इसकी रिक्वेस्ट आती है।",
  Specialised: "खास",
  "Some centres collect plasma or other specific components by apheresis. Availability and criteria vary by centre.":
    "कुछ सेंटर एफ़ेरेसिस से प्लाज़्मा या खून के दूसरे खास हिस्से लेते हैं। यह सुविधा और इसके नियम हर सेंटर में अलग होते हैं।",
  "Compare donation types": "रक्तदान के प्रकारों की तुलना करें",

  // --- Homepage: blood groups ---------------------------------------------------------
  "Blood groups": "ब्लड ग्रुप",
  "Knowing your group helps volunteers reach the right donors faster. Compatibility depends on more than the ABO and Rh group: hospitals always cross-match in the laboratory before a transfusion. Transfusion decisions belong to qualified healthcare professionals and licensed blood banks.":
    "अपना ब्लड ग्रुप पता होने से स्वयंसेवक सही डोनरों तक जल्दी पहुँच पाते हैं। खून का मेल सिर्फ़ ABO और Rh ग्रुप पर निर्भर नहीं करता: खून चढ़ाने से पहले अस्पताल हमेशा लैब में क्रॉस-मैच करते हैं। खून चढ़ाने के फ़ैसले योग्य डॉक्टर-स्वास्थ्यकर्मी और लाइसेंस वाले ब्लड बैंक ही लेते हैं।",
  "The eight main blood groups": "आठ मुख्य ब्लड ग्रुप",
  "Blood group {group}": "ब्लड ग्रुप {group}",

  // --- Homepage: impact & stories -----------------------------------------------------
  "Community impact": "समुदाय पर असर",
  "Calculated live from platform records. Unverified data is never counted as verified.":
    "प्लेटफ़ॉर्म के रिकॉर्ड से लाइव गिने गए आँकड़े। बिना जाँचे डेटा को कभी जाँचा हुआ नहीं गिना जाता।",
  "Stories from our community": "हमारे समुदाय की कहानियाँ",
  "Real experiences, published only with each contributor's consent.": "सच्चे अनुभव, जो हर कहानी भेजने वाले की सहमति से ही प्रकाशित होते हैं।",
  "All stories": "सभी कहानियाँ",
  "No stories published yet": "अभी कोई कहानी प्रकाशित नहीं हुई",
  "Stories appear here after contributors share them and our team reviews them with their consent.":
    "लोग जब अपनी कहानी भेजते हैं और हमारी टीम उनकी सहमति से उसे जाँच लेती है, तब कहानियाँ यहाँ दिखती हैं।",

  // --- Homepage: preparation & aftercare ----------------------------------------------
  "Preparing to donate & aftercare": "रक्तदान की तैयारी और बाद की देखभाल",
  "Before you donate": "रक्तदान से पहले",
  "Sleep well and eat a regular meal beforehand.": "अच्छी नींद लें और पहले रोज़ जैसा खाना खाएँ।",
  "Drink plenty of water; avoid alcohol the day before.": "खूब पानी पिएँ; एक दिन पहले शराब न पिएँ।",
  "Carry a photo ID and tell staff about any medicines.": "फ़ोटो वाला पहचान पत्र साथ रखें, और कोई दवा लेते हों तो स्टाफ़ को बताएँ।",
  "Answer the screening questions honestly — it keeps everyone safe.": "जाँच के सवालों के जवाब सच-सच दें — इससे सब सुरक्षित रहते हैं।",
  "After you donate": "रक्तदान के बाद",
  "Rest for 10–15 minutes and have the refreshments offered.": "10–15 मिनट आराम करें और जो नाश्ता-पानी दिया जाए, वह लें।",
  "Drink extra fluids and avoid heavy exercise for the rest of the day.": "ज़्यादा पानी और तरल चीज़ें पिएँ, और बाकी दिन भारी कसरत न करें।",
  "If you feel faint, lie down with your legs raised and tell staff.": "बेहोशी जैसा लगे तो पैर ऊपर करके लेट जाएँ और स्टाफ़ को बताएँ।",
  "Contact the blood centre if you feel unwell later.": "बाद में तबीयत ठीक न लगे तो ब्लड बैंक से संपर्क करें।",
  "What to expect at the centre": "सेंटर पर क्या होता है",

  // --- Homepage: FAQ preview ------------------------------------------------------------
  "Frequently asked questions": "अक्सर पूछे जाने वाले सवाल",
  "All FAQs": "सभी सवाल-जवाब",
  "Who can see my phone number?": "मेरा फ़ोन नंबर कौन देख सकता है?",
  "No one publicly. An authorised volunteer can view it only while coordinating a verified request, only if you allowed contact — and every access is logged.":
    "यह किसी को सार्वजनिक रूप से नहीं दिखता। अधिकृत स्वयंसेवक इसे सिर्फ़ तब देख सकते हैं जब वे किसी जाँची गई रिक्वेस्ट पर तालमेल कर रहे हों, और सिर्फ़ तब जब आपने संपर्क की इजाज़त दी हो — और हर बार देखने का रिकॉर्ड रखा जाता है।",
  "Does registering mean I'm eligible to donate?": "क्या रजिस्टर करने का मतलब है कि मैं रक्तदान कर सकता/सकती हूँ?",
  "No. Eligibility is decided by the blood centre's screening on the day. Rakt Response never makes medical decisions.":
    "नहीं। आप रक्तदान कर सकते हैं या नहीं, यह उसी दिन ब्लड बैंक की जाँच से तय होता है। Rakt Response कभी कोई मेडिकल फ़ैसला नहीं लेता।",
  "Is whole blood the same as SDP?": "क्या होल ब्लड और SDP एक ही हैं?",
  "No. SDP (single donor platelets) is collected by a machine over a longer session and has different checks and intervals.":
    "नहीं। SDP (एक डोनर से प्लेटलेट्स) मशीन से लिया जाता है, इसमें ज़्यादा समय लगता है, और इसकी जाँच और अंतराल अलग होते हैं।",
  "What should I do in an emergency?": "इमरजेंसी में मुझे क्या करना चाहिए?",
  "Contact the treating hospital or the nearest licensed blood bank immediately. You can also submit a request here for volunteer support.":
    "तुरंत इलाज करने वाले अस्पताल या नज़दीकी लाइसेंस वाले ब्लड बैंक से संपर्क करें। स्वयंसेवकों की मदद के लिए आप यहाँ रिक्वेस्ट भी भेज सकते हैं।",

  // --- Homepage: call to action ---------------------------------------------------------
  "Be the response someone is waiting for.": "वह जवाब बनिए, जिसका कोई इंतज़ार कर रहा है।",
  "Join our community of voluntary donors. Your details stay private, and you choose when you can be contacted.":
    "हमारे स्वैच्छिक डोनरों के समुदाय से जुड़ें। आपकी जानकारी निजी रहती है, और आपसे कब संपर्क हो, यह आप तय करते हैं।",
  "Contact the team": "टीम से संपर्क करें",
  "In a medical emergency": "मेडिकल इमरजेंसी में",
  "Contact the treating hospital or the nearest licensed blood bank immediately. Rakt Response helps coordinate voluntary donors but cannot reserve blood units or guarantee availability.":
    "तुरंत इलाज करने वाले अस्पताल या नज़दीकी लाइसेंस वाले ब्लड बैंक से संपर्क करें। Rakt Response स्वैच्छिक डोनरों से तालमेल में मदद करता है, लेकिन खून की यूनिट रिज़र्व नहीं कर सकता और खून मिलने की गारंटी नहीं दे सकता।",

  // --- Impact page (src/app/(site)/impact/page.tsx) ------------------------------------
  "Transparent, record-based figures, real stories shared with consent, and how Rakt Response works.":
    "रिकॉर्ड पर आधारित साफ़ आँकड़े, सहमति से साझा की गई सच्ची कहानियाँ, और Rakt Response कैसे काम करता है।",
  "Real people.": "असली लोग।",
  "Real numbers.": "असली आँकड़े।",
  "Every figure comes straight from verified records. Every story is shared with permission.":
    "हर आँकड़ा सीधे जाँचे गए रिकॉर्ड से आता है। हर कहानी इजाज़त से साझा की जाती है।",
  "No made-up stats": "कोई मनगढ़ंत आँकड़ा नहीं",
  "Verified ≠ self-reported": "जाँचा गया ≠ खुद बताया गया",
  "Open about how we work": "हम कैसे काम करते हैं, सब खुलकर",
  "Impact dashboard": "असर का डैशबोर्ड",
  "Each figure is counted live from records. Unverified data is never shown as verified.":
    "हर आँकड़ा रिकॉर्ड से लाइव गिना जाता है। बिना जाँचे डेटा को कभी जाँचा हुआ नहीं दिखाया जाता।",
  "Median time from verification to active coordination:": "जाँच से लेकर सक्रिय तालमेल शुरू होने तक का बीच का (मीडियन) समय:",
  "{hours} hours": "{hours} घंटे",
  "(based on {count} requests with recorded timestamps).": "(दर्ज समय वाली {count} रिक्वेस्ट के आधार पर)।",
  "Self-reported donations awaiting verification: {count} — shown separately and not included in verified totals.":
    "खुद बताए गए रक्तदान जिनकी जाँच बाकी है: {count} — इन्हें अलग दिखाया गया है और जाँचे गए कुल आँकड़ों में नहीं जोड़ा गया।",
  "Documented figures from partners": "साथी संस्थाओं के लिखित आँकड़े",
  "Figures we cannot derive from platform records, each with its source and verification date.":
    "वे आँकड़े जो हम प्लेटफ़ॉर्म के रिकॉर्ड से नहीं निकाल सकते, हर एक अपने स्रोत और पुष्टि की तारीख के साथ।",
  "Period: {start} – {end}.": "अवधि: {start} – {end}।",
  "Source: {source}. Verified {date}.": "स्रोत: {source}। पुष्टि: {date}।",
  "Stories of donors, families and volunteers": "डोनरों, परिवारों और स्वयंसेवकों की कहानियाँ",
  "We only publish real experiences after review and with the contributor's consent.":
    "हम सच्चे अनुभव सिर्फ़ जाँच के बाद और कहानी भेजने वाले की सहमति से ही प्रकाशित करते हैं।",
  "Blood donation camps": "रक्तदान कैंप",
  "Registrations and attendance are never counted as completed donations.": "रजिस्ट्रेशन और हाज़िरी को कभी पूरा हुआ रक्तदान नहीं गिना जाता।",
  "With {partners}": "{partners} के साथ",
  "Verified units collected": "जमा हुई यूनिट (जाँची गई)",
  "Registrations (not donations)": "रजिस्ट्रेशन (रक्तदान नहीं)",
  "Learnings: {learnings}": "सीख: {learnings}",
  "Figures verified {date}": "आँकड़ों की पुष्टि: {date}",
  "Source: {source}": "स्रोत: {source}",
  "Participation figures not yet verified.": "भागीदारी के आँकड़ों की अभी पुष्टि नहीं हुई।",
  "No camps recorded yet": "अभी कोई कैंप दर्ज नहीं",
  "Completed camps appear here once administrators record and verify them.":
    "एडमिन जब पूरे हुए कैंप दर्ज करके उनकी पुष्टि कर देते हैं, तब वे यहाँ दिखते हैं।",
  "How We Work": "हम कैसे काम करते हैं",
  "What happens behind the scenes, in plain language.": "पर्दे के पीछे क्या होता है, आसान भाषा में।",
  "Donor registration & verification": "डोनर रजिस्ट्रेशन और पुष्टि",
  "Donors register themselves and are verified once they confirm their email. Profiles are private by default, and blood groups are marked verified only after an administrator checks a document. Verification never decides medical eligibility.":
    "डोनर खुद रजिस्टर करते हैं, और ईमेल की पुष्टि करते ही उनकी पुष्टि हो जाती है। प्रोफ़ाइल शुरू से निजी रहती है, और ब्लड ग्रुप तभी \"जाँचा गया\" माना जाता है जब कोई एडमिन कोई दस्तावेज़ देख ले। यह पुष्टि कभी तय नहीं करती कि आप मेडिकल तौर पर रक्तदान कर सकते हैं या नहीं।",
  "Reviewing blood requests": "खून की रिक्वेस्ट की जाँच",
  "Every request is checked by an authorised volunteer — usually with the requester or hospital — before it is marked verified, shown publicly or sent to donors.":
    "हर रिक्वेस्ट को \"जाँचा गया\" मानने, सबको दिखाने या डोनरों को भेजने से पहले एक अधिकृत स्वयंसेवक उसकी जाँच करते हैं — आमतौर पर रिक्वेस्ट भेजने वाले या अस्पताल से बात करके।",
  "Coordinating with donors": "डोनरों से तालमेल",
  "Volunteers contact only donors who allowed it, or who accept a contact request. Each access to contact details is logged and rate-limited.":
    "स्वयंसेवक सिर्फ़ उन्हीं डोनरों से संपर्क करते हैं जिन्होंने इजाज़त दी है, या जो संपर्क की रिक्वेस्ट मान लेते हैं। संपर्क की जानकारी हर बार देखने का रिकॉर्ड रखा जाता है, और इसकी एक सीमा तय है।",
  "Updating donation records": "रक्तदान के रिकॉर्ड अपडेट करना",
  "Donors add donations as self-reported. Authorised reviewers verify them separately for whole blood and SDP.":
    "डोनर अपने रक्तदान \"खुद बताया गया\" के रूप में जोड़ते हैं। अधिकृत समीक्षक होल ब्लड और SDP के लिए इनकी अलग-अलग जाँच करते हैं।",
  "Protecting privacy": "प्राइवेसी की सुरक्षा",
  "No public donor lists, phone numbers or addresses. Permissions are enforced by the database, not only the app.":
    "डोनरों की कोई सार्वजनिक सूची, फ़ोन नंबर या पता नहीं दिखाया जाता। कौन क्या देख सकता है, यह सिर्फ़ ऐप ही नहीं, डेटाबेस भी तय करता है।",
  "What we can and cannot guarantee": "हम किस बात की गारंटी दे सकते हैं और किसकी नहीं",
  "We help find willing voluntary donors. We cannot guarantee availability, reserve blood, certify compatibility or replace hospitals and licensed blood banks.":
    "हम रक्तदान के लिए तैयार स्वैच्छिक डोनर ढूँढने में मदद करते हैं। हम खून मिलने की गारंटी नहीं दे सकते, खून रिज़र्व नहीं कर सकते, ब्लड मैच की पुष्टि नहीं कर सकते, और अस्पताल या लाइसेंस वाले ब्लड बैंक की जगह नहीं ले सकते।",
  "Report inaccurate information": "गलत जानकारी के बारे में बताएँ",
  "If a figure, request or story looks wrong, please": "अगर कोई आँकड़ा, रिक्वेस्ट या कहानी गलत लगे, तो कृपया हमें",
  "tell us": "बताएँ",
  ". We will review it and correct or remove it.": "। हम उसे जाँचकर ठीक करेंगे या हटा देंगे।",
  "Corrections and removal": "सुधार और हटाना",
  "Contributors can request a correction or withdraw their story at any time from":
    "कहानी भेजने वाले कभी भी अपनी कहानी में सुधार माँग सकते हैं या उसे वापस ले सकते हैं, यहाँ से:",
  ". Withdrawal removes it from the website immediately.": "। वापस लेने पर कहानी वेबसाइट से तुरंत हट जाती है।",

  // --- Impact figures (src/components/impact/impact-stats.tsx + impact page) -----------
  "Registered donors": "रजिस्टर्ड डोनर",
  "Active donor accounts with a confirmed email address.": "पुष्टि किए गए ईमेल वाले सक्रिय डोनर खाते।",
  "Verified donors": "पुष्टि वाले डोनर",
  "Registered donors who confirmed their email address.": "रजिस्टर्ड डोनर, जिन्होंने अपने ईमेल की पुष्टि की है।",
  "Registered donors who confirmed their email address. Verification is not a medical eligibility decision.":
    "रजिस्टर्ड डोनर, जिन्होंने अपने ईमेल की पुष्टि की है। यह पुष्टि रक्तदान की मेडिकल योग्यता का फ़ैसला नहीं है।",
  "Verified whole blood donations": "जाँचे गए होल ब्लड रक्तदान",
  "Whole blood donation records verified by an authorised volunteer or administrator.":
    "होल ब्लड रक्तदान के रिकॉर्ड, जिन्हें अधिकृत स्वयंसेवक या एडमिन ने जाँचा है।",
  "Verified SDP donations": "जाँचे गए SDP रक्तदान",
  "Single donor platelet donation records that have been verified.": "एक डोनर से प्लेटलेट्स (SDP) रक्तदान के जाँचे गए रिकॉर्ड।",
  "Single donor platelet records that have been verified. Counted separately from whole blood.":
    "एक डोनर से प्लेटलेट्स (SDP) के जाँचे गए रिकॉर्ड। इन्हें होल ब्लड से अलग गिना जाता है।",
  "Blood requests received": "मिली हुई खून की रिक्वेस्ट",
  "Requests submitted to volunteers (excluding drafts). Includes requests that could not be verified.":
    "स्वयंसेवकों को भेजी गई रिक्वेस्ट (ड्राफ़्ट छोड़कर)। इसमें वे रिक्वेस्ट भी शामिल हैं जिनकी जाँच नहीं हो पाई।",
  "Requests verified": "जाँची गई रिक्वेस्ट",
  "Requests a volunteer confirmed with the requester or hospital.": "वे रिक्वेस्ट, जिनकी स्वयंसेवक ने रिक्वेस्ट भेजने वाले या अस्पताल से पुष्टि की।",
  "Requests coordinated": "रिक्वेस्ट जिन पर तालमेल हुआ",
  "Verified requests where volunteers actively coordinated with potential donors.":
    "जाँची गई रिक्वेस्ट, जिन पर स्वयंसेवकों ने संभावित डोनरों से सक्रिय रूप से तालमेल किया।",
  "Verified requests that volunteers actively coordinated with potential donors.":
    "जाँची गई रिक्वेस्ट, जिन पर स्वयंसेवकों ने संभावित डोनरों से सक्रिय रूप से तालमेल किया।",
  "Requests fulfilled": "पूरी हुई रिक्वेस्ट",
  "Closed as fulfilled with a confirmation note. Contacting a donor or receiving interest does not count.":
    "पुष्टि के नोट के साथ \"पूरी हुई\" के रूप में बंद की गई। सिर्फ़ डोनर से संपर्क करना या डोनर का तैयार होना इसमें नहीं गिना जाता।",
  "Requests closed as fulfilled with a confirmation note — not just a donor contacted or interested.":
    "पुष्टि के नोट के साथ \"पूरी हुई\" के रूप में बंद रिक्वेस्ट — सिर्फ़ डोनर से संपर्क या डोनर का तैयार होना नहीं।",
  "Donation camps organised": "लगाए गए रक्तदान कैंप",
  "Completed camps recorded by administrators.": "पूरे हो चुके कैंप, जिन्हें एडमिन ने दर्ज किया है।",
  "Live figures are not available right now": "अभी लाइव आँकड़े उपलब्ध नहीं हैं",
  "Our community statistics are calculated live from verified records. They will appear here when the database is reachable. We never show estimated or placeholder numbers.":
    "हमारे समुदाय के आँकड़े जाँचे गए रिकॉर्ड से लाइव गिने जाते हैं। डेटाबेस से जुड़ते ही ये यहाँ दिखेंगे। हम कभी अंदाज़े वाले या नकली आँकड़े नहीं दिखाते।",
  "We're just getting started — these figures are live and will grow as records are verified.":
    "हमने अभी शुरुआत की है — ये आँकड़े लाइव हैं और रिकॉर्ड की जाँच के साथ बढ़ेंगे।",
  "Live figures from verified platform records since {since}. Updated {updated}.":
    "{since} से प्लेटफ़ॉर्म के जाँचे गए रिकॉर्ड के लाइव आँकड़े। अपडेट: {updated}।",
  "Live figures from verified platform records. Updated {updated}.": "प्लेटफ़ॉर्म के जाँचे गए रिकॉर्ड के लाइव आँकड़े। अपडेट: {updated}।",

  // --- Logo (src/components/brand/logo.tsx) ----------------------------------------------
  "Rakt Response Team logo": "Rakt Response टीम का लोगो",
  "Rakt Response home": "Rakt Response होम",
  "We Respond · We Support · We Save Lives": "हम जवाब देते हैं · हम साथ देते हैं · हम जान बचाते हैं",

  // --- Pagination (src/components/common/pagination.tsx) ---------------------------------
  Pagination: "पेज",
  Previous: "पिछला",
  Next: "अगला",
  "Page {page} of {pages}": "{pages} में से पेज {page}",

  // --- Not found, error, offline -------------------------------------------------------------
  "Page not found": "पेज नहीं मिला",
  "We couldn't find that page": "हमें यह पेज नहीं मिला",
  "It may have moved, or the link may be incomplete.": "हो सकता है पेज कहीं और चला गया हो, या लिंक अधूरा हो।",
  "Go home": "होम पर जाएँ",
  "Something went wrong": "कुछ गड़बड़ हो गई",
  "We couldn't load this page": "हम यह पेज नहीं खोल पाए",
  "Please try again. If someone needs blood urgently, contact the treating hospital or the nearest licensed blood bank directly.":
    "कृपया फिर से कोशिश करें। अगर किसी को जल्दी खून चाहिए, तो सीधे इलाज करने वाले अस्पताल या नज़दीकी लाइसेंस वाले ब्लड बैंक से संपर्क करें।",
  "Try again": "फिर से कोशिश करें",
  "You're offline": "आप ऑफ़लाइन हैं",
  "Rakt Response needs a connection to show requests and your profile. If someone needs blood urgently, contact the treating hospital or the nearest licensed blood bank by phone.":
    "रिक्वेस्ट और आपकी प्रोफ़ाइल दिखाने के लिए Rakt Response को इंटरनेट चाहिए। अगर किसी को जल्दी खून चाहिए, तो इलाज करने वाले अस्पताल या नज़दीकी लाइसेंस वाले ब्लड बैंक को फ़ोन करें।",
};

export default hi;
