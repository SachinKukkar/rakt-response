import type { Catalog } from "./types";

/**
 * Messages produced outside page components: server action results
 * (src/actions), validation errors (src/lib/validation), friendly error text
 * (src/lib/errors.ts), image upload errors, and text written by the database
 * (notifications and `raise exception` messages in supabase/migrations).
 *
 * Keys with {placeholders} are templates: they also translate finished
 * messages that already contain values, e.g. "Request RR-261012-AB12C: Verified".
 * Keep the English key exactly as written in the code / SQL.
 */
const hi: Catalog = {
  // --- Shared action helpers (src/lib/action-result.ts) -------------------------
  "Please check the highlighted fields.": "कृपया निशान लगी जगहों को जाँच लें।",
  "Please check the details.": "कृपया जानकारी जाँच लें।",

  // --- Friendly errors (src/lib/errors.ts) -------------------------------------
  "Something went wrong. Please try again in a moment.": "कुछ गड़बड़ हो गई। कृपया थोड़ी देर बाद फिर से कोशिश करें।",
  "This looks like a duplicate of something you already added.": "लगता है यह आप पहले ही जोड़ चुके हैं।",
  "Some of the details are not valid. Please check the form and try again.": "कुछ जानकारी सही नहीं है। कृपया फ़ॉर्म जाँचकर फिर से कोशिश करें।",
  "You do not have permission to do that.": "आपको यह करने की अनुमति नहीं है।",

  // --- Photo uploads (src/lib/images.ts, src/lib/client-image.ts) --------------
  "The photo is empty.": "फ़ोटो खाली है।",
  "Photos must be smaller than {size} MB.": "फ़ोटो {size} MB से छोटी होनी चाहिए।",
  "Photos must be smaller than 3 MB.": "फ़ोटो 3 MB से छोटी होनी चाहिए।",
  "Please upload a JPEG, PNG or WebP photo.": "कृपया JPEG, PNG या WebP फ़ोटो अपलोड करें।",
  "This photo could not be processed. Please try a different image.": "यह फ़ोटो इस्तेमाल नहीं हो सकी। कृपया कोई दूसरी फ़ोटो आज़माएँ।",
  "Please choose an image file.": "कृपया फ़ोटो वाली फ़ाइल चुनें।",
  "Your browser could not process this photo.": "आपका ब्राउज़र यह फ़ोटो तैयार नहीं कर पाया।",

  // --- Dashboard checklist (src/lib/data/member.ts) ----------------------------
  "Add your blood group": "अपना ब्लड ग्रुप जोड़ें",
  "Add a mobile number": "मोबाइल नंबर जोड़ें",
  "Add your area": "अपना इलाका जोड़ें",
  "Record your donation history": "अपना रक्तदान रिकॉर्ड दर्ज करें",

  // --- Sign in, sign up, passwords (src/actions/auth.ts) -----------------------
  "Accounts are not available yet: the Rakt Response database has not been configured.":
    "अभी खाते नहीं बन सकते: Rakt Response का डेटाबेस अभी सेट नहीं हुआ है।",
  "Please confirm your email address first. Check your inbox for the verification link.":
    "कृपया पहले अपने ईमेल की पुष्टि करें। पुष्टि का लिंक अपने इनबॉक्स में देखें।",
  "Too many sign-in attempts. Please wait a few minutes and try again.": "साइन इन की बहुत ज़्यादा कोशिशें हुईं। कृपया कुछ मिनट रुककर फिर से कोशिश करें।",
  "The email or password is incorrect.": "ईमेल या पासवर्ड गलत है।",
  "New registrations are paused at the moment. Please check back soon.": "अभी नए रजिस्ट्रेशन रुके हुए हैं। कृपया कुछ समय बाद फिर देखें।",
  "Too many sign-up attempts. Please wait a while and try again.": "खाता बनाने की बहुत ज़्यादा कोशिशें हुईं। कृपया थोड़ी देर रुककर फिर से कोशिश करें।",
  "Please choose a stronger password.": "कृपया ज़्यादा मज़बूत पासवर्ड चुनें।",
  "We could not create your account. Please check your details and try again.": "हम आपका खाता नहीं बना पाए। कृपया अपनी जानकारी जाँचकर फिर से कोशिश करें।",
  "Your account is ready.": "आपका खाता तैयार है।",
  "Check your email to confirm your account.": "खाते की पुष्टि के लिए अपना ईमेल देखें।",
  "Too many reset requests. Please wait a while and try again.": "पासवर्ड बदलने की बहुत ज़्यादा रिक्वेस्ट हुईं। कृपया थोड़ी देर रुककर फिर से कोशिश करें।",
  "If an account exists for that email, a password reset link is on its way. It may take a few minutes.":
    "अगर इस ईमेल से कोई खाता है, तो पासवर्ड बदलने का लिंक भेजा जा रहा है। इसमें कुछ मिनट लग सकते हैं।",
  "Please wait a little before requesting another email.": "दूसरा ईमेल माँगने से पहले कृपया थोड़ा रुकें।",
  "If that email is waiting for confirmation, we have sent a new link.": "अगर इस ईमेल की पुष्टि बाकी है, तो हमने नया लिंक भेज दिया है।",
  "Your reset link has expired. Please request a new one.": "पासवर्ड बदलने वाले लिंक का समय खत्म हो गया है। कृपया नया लिंक माँगें।",
  "We could not update your password. Please choose a different password and try again.":
    "हम आपका पासवर्ड नहीं बदल पाए। कृपया कोई दूसरा पासवर्ड चुनकर फिर से कोशिश करें।",

  // --- Profile & settings (src/actions/profile.ts) -----------------------------
  "Profile updated.": "प्रोफ़ाइल अपडेट हो गई।",
  "This feature is not configured.": "यह सुविधा अभी सेट नहीं है।",
  "Please sign in again and retry.": "कृपया फिर से साइन इन करके कोशिश करें।",
  "Your email is already verified.": "आपके ईमेल की पुष्टि पहले ही हो चुकी है।",
  "We couldn't send the email right now. Please try again in a few minutes.": "हम अभी ईमेल नहीं भेज पाए। कृपया कुछ मिनट बाद फिर से कोशिश करें।",
  "We've sent a new verification link to {email}.": "हमने {email} पर पुष्टि का नया लिंक भेज दिया है।",
  "Location updated.": "जगह की जानकारी अपडेट हो गई।",
  "Your choices were saved.": "आपकी पसंद सेव हो गई।",
  "To be open to contact, first allow Rakt Mitras to contact you in Privacy & settings.":
    "संपर्क के लिए तैयार दिखने के लिए, पहले प्राइवेसी और सेटिंग्स में रक्त मित्रों को संपर्क करने की अनुमति दें।",
  "You're marked as open to contact.": "आप संपर्क के लिए तैयार दिख रहे हैं।",
  "You're marked as unavailable. Rakt Mitras won't contact you.": "आप अभी उपलब्ध नहीं दिख रहे हैं। रक्त मित्र आपसे संपर्क नहीं करेंगे।",
  "Correction requested. An administrator will review it; your verified blood group stays until then.":
    "सुधार की रिक्वेस्ट भेज दी गई। एडमिन इसे देखेंगे; तब तक आपका पुष्टि वाला ब्लड ग्रुप ही रहेगा।",
  "Blood group updated.": "ब्लड ग्रुप अपडेट हो गया।",
  "Choose a photo to upload.": "अपलोड करने के लिए फ़ोटो चुनें।",
  "Photo uploads are unavailable right now. Please try again later.": "अभी फ़ोटो अपलोड नहीं हो सकती। कृपया बाद में फिर से कोशिश करें।",
  "Profile photo updated.": "प्रोफ़ाइल फ़ोटो अपडेट हो गई।",
  "Photo removed.": "फ़ोटो हटा दी गई।",
  "Type DELETE in capitals to confirm.": "पक्का करने के लिए बड़े अक्षरों में DELETE लिखें।",
  "Type DELETE to confirm": "पक्का करने के लिए DELETE लिखें",
  "Deletion requested. You've been removed from the donor directory and contact lists. An administrator will complete the request.":
    "खाता हटाने की रिक्वेस्ट भेज दी गई। आपको डोनर सूची और संपर्क सूचियों से हटा दिया गया है। एडमिन यह काम पूरा करेंगे।",
  "Deletion request cancelled. Review your privacy choices to rejoin the directory.":
    "खाता हटाने की रिक्वेस्ट रद्द कर दी गई। डोनर सूची में फिर से जुड़ने के लिए अपनी प्राइवेसी पसंद देख लें।",
  "Marked as read.": "पढ़ी हुई मार्क हो गई।",
  "All notifications marked as read.": "सभी सूचनाएँ पढ़ी हुई मार्क हो गईं।",
  "Cleared read notifications.": "पढ़ी हुई सूचनाएँ हटा दी गईं।",

  // --- Donation records (src/actions/donations.ts) -----------------------------
  "Complete your donor profile (blood group) before recording donations.": "रक्तदान दर्ज करने से पहले अपनी डोनर प्रोफ़ाइल (ब्लड ग्रुप) पूरी करें।",
  "You've added many records today. Please try again tomorrow.": "आज आपने बहुत सारे रिकॉर्ड जोड़ दिए हैं। कृपया कल फिर से कोशिश करें।",
  "Possible duplicate": "शायद यह पहले से जुड़ा है",
  "You already have a record of this type on this date.": "इस तारीख पर इस तरह का रिकॉर्ड आपके पास पहले से है।",
  "Donation recorded. It will show as self-reported until a Rakt Mitra verifies it.":
    "रक्तदान दर्ज हो गया। जब तक रक्त मित्र इसकी जाँच नहीं करते, यह “खुद बताया गया” दिखेगा।",
  "Invalid record.": "रिकॉर्ड सही नहीं है।",
  "Only your own records that are still pending review can be removed.": "आप सिर्फ़ अपने वही रिकॉर्ड हटा सकते हैं जिनकी जाँच अभी बाकी है।",
  "Record removed.": "रिकॉर्ड हटा दिया गया।",

  // --- Blood requests (src/actions/requests.ts) --------------------------------
  "Requests cannot be submitted yet: the database is not configured.": "अभी रिक्वेस्ट नहीं भेजी जा सकती: डेटाबेस अभी सेट नहीं हुआ है।",
  "Your request could not be submitted.": "आपकी रिक्वेस्ट नहीं भेजी जा सकी।",
  "Please choose a valid date and time.": "कृपया सही तारीख और समय चुनें।",
  "Choose the date and time": "तारीख और समय चुनें",
  "Please sign in to submit a request. For emergencies, contact the hospital blood bank directly.":
    "रिक्वेस्ट भेजने के लिए कृपया साइन इन करें। इमरजेंसी में सीधे अस्पताल के ब्लड बैंक से संपर्क करें।",
  "We could not submit your request. Please try again.": "हम आपकी रिक्वेस्ट नहीं भेज पाए। कृपया फिर से कोशिश करें।",
  "Request submitted.": "रिक्वेस्ट भेज दी गई।",
  "Invalid request.": "रिक्वेस्ट सही नहीं है।",
  "Cancelled by requester": "माँगने वाले ने रद्द की",
  "Your request was cancelled. Thank you for letting us know.": "आपकी रिक्वेस्ट रद्द कर दी गई। हमें बताने के लिए धन्यवाद।",
  "Invalid response.": "जवाब सही नहीं है।",
  "Thank you. A Rakt Mitra will be in touch if your help is needed. Please don't go to the hospital until they confirm.":
    "धन्यवाद। अगर आपकी मदद की ज़रूरत होगी तो रक्त मित्र आपसे संपर्क करेंगे। जब तक वे पक्का न करें, कृपया अस्पताल न जाएँ।",
  "Thanks for letting us know.": "बताने के लिए धन्यवाद।",
  "Invalid contact request.": "संपर्क रिक्वेस्ट सही नहीं है।",
  "Thank you. The Rakt Mitra can now see your contact details for this request.": "धन्यवाद। अब रक्त मित्र इस रिक्वेस्ट के लिए आपकी संपर्क जानकारी देख सकते हैं।",
  "Declined. Your details were not shared.": "मना कर दिया गया। आपकी जानकारी नहीं दी गई।",

  // --- Stories (src/actions/stories.ts) ----------------------------------------
  "Please sign in to share your story.": "अपनी कहानी बताने के लिए कृपया साइन इन करें।",
  "Your story could not be read. Please try again.": "आपकी कहानी पढ़ी नहीं जा सकी। कृपया फिर से कोशिश करें।",
  "Invalid camp selection.": "चुना गया कैंप सही नहीं है।",
  "We couldn't upload your photo right now. You can submit without it and add one later by contacting us.":
    "हम अभी आपकी फ़ोटो अपलोड नहीं कर पाए। आप बिना फ़ोटो के भेज सकते हैं और बाद में हमसे संपर्क करके फ़ोटो जोड़ सकते हैं।",
  "We could not submit your story. Please try again.": "हम आपकी कहानी नहीं भेज पाए। कृपया फिर से कोशिश करें।",
  "Thank you for sharing. Our team will review your story before anything is published.":
    "बताने के लिए धन्यवाद। कुछ भी प्रकाशित होने से पहले हमारी टीम आपकी कहानी देखेगी।",
  "Invalid story.": "कहानी सही नहीं है।",
  "Your story has been withdrawn and is no longer public.": "आपकी कहानी वापस ले ली गई है और अब सबको नहीं दिखती।",
  "Please describe the correction.": "कृपया बताएँ कि क्या सुधार करना है।",
  "Please describe the correction": "कृपया बताएँ कि क्या सुधार करना है",
  "Thanks — a reviewer will look at your correction request.": "धन्यवाद — एक समीक्षक आपकी सुधार रिक्वेस्ट देखेंगे।",
  "Your choices were saved. Anything you turned off is hidden immediately.": "आपकी पसंद सेव हो गई। जो भी आपने बंद किया, वह तुरंत छिप गया है।",

  // --- Volunteer coordination (src/actions/volunteer.ts) -----------------------
  "Status updated.": "स्थिति बदल दी गई।",
  "Choose a valid date and time.": "सही तारीख और समय चुनें।",
  "Request details edited by a Rakt Mitra.": "रक्त मित्र ने रिक्वेस्ट की जानकारी बदली।",
  "Request details saved.": "रिक्वेस्ट की जानकारी सेव हो गई।",
  "Invalid assignment.": "सौंपा गया काम सही नहीं है।",
  "Rakt Mitra assigned.": "रक्त मित्र को काम सौंप दिया गया।",
  "You're now coordinating this request.": "अब आप यह रिक्वेस्ट संभाल रहे हैं।",
  "Assignment updated.": "सौंपा गया काम अपडेट हो गया।",
  "Assignment closed.": "सौंपा गया काम बंद कर दिया गया।",
  "Contact attempt logged.": "संपर्क की कोशिश दर्ज हो गई।",
  "Coordination updated.": "तालमेल की जानकारी अपडेट हो गई।",
  "Contact details are not available.": "संपर्क जानकारी उपलब्ध नहीं है।",
  "Contact request sent. The donor decides whether to share their details.": "संपर्क रिक्वेस्ट भेज दी गई। अपनी जानकारी देनी है या नहीं, यह डोनर तय करेंगे।",
  "Invalid review.": "जाँच की जानकारी सही नहीं है।",
  "Record verified.": "रिकॉर्ड जाँचा गया।",
  "Record marked as not verified.": "रिकॉर्ड को “पुष्टि नहीं हुई” मार्क किया गया।",
  "Note added.": "नोट जोड़ दिया गया।",
  "Expired {expired} stale request(s); sent {reminders} follow-up reminder(s).":
    "{expired} पुरानी रिक्वेस्ट का समय खत्म किया गया; {reminders} फ़ॉलो-अप रिमाइंडर भेजे गए।",

  // --- Administration (src/actions/admin.ts) -----------------------------------
  "Invalid verification.": "पुष्टि की जानकारी सही नहीं है।",
  "Verification updated and the donor was notified.": "पुष्टि की स्थिति बदल दी गई और डोनर को सूचना भेज दी गई।",
  "Donor details saved.": "डोनर की जानकारी सेव हो गई।",
  "Invalid profile.": "प्रोफ़ाइल सही नहीं है।",
  "Blood group correction resolved.": "ब्लड ग्रुप सुधार का फ़ैसला हो गया।",
  "Account reactivated.": "खाता फिर से चालू कर दिया गया।",
  "Account deactivated and removed from the directory.": "खाता बंद कर दिया गया और डोनर सूची से हटा दिया गया।",
  "Type ANONYMISE to confirm.": "पक्का करने के लिए ANONYMISE लिखें।",
  "Profile anonymised and photos removed.": "प्रोफ़ाइल से पहचान और फ़ोटो हटा दी गईं।",
  "Profile anonymised and photos removed. The login could not be deleted automatically.":
    "प्रोफ़ाइल से पहचान और फ़ोटो हटा दी गईं। लॉगिन अपने-आप नहीं हटाया जा सका।",
  "Profile anonymised and photos removed. Sign-in could not be blocked automatically.":
    "प्रोफ़ाइल से पहचान और फ़ोटो हटा दी गईं। साइन इन अपने-आप बंद नहीं हो सका।",
  "Profile anonymised and photos removed. Sign-in has been blocked and the email removed.":
    "प्रोफ़ाइल से पहचान और फ़ोटो हटा दी गईं। साइन इन बंद कर दिया गया और ईमेल हटा दिया गया।",
  "Profile anonymised and photos removed. Configure SUPABASE_SERVICE_ROLE_KEY to also remove the login automatically, or delete the user in the Supabase dashboard.":
    "प्रोफ़ाइल से पहचान और फ़ोटो हटा दी गईं। लॉगिन भी अपने-आप हटाने के लिए SUPABASE_SERVICE_ROLE_KEY सेट करें, या Supabase डैशबोर्ड में यूज़र को हटा दें।",
  "Account and all associated records were permanently deleted.": "खाता और उससे जुड़े सभी रिकॉर्ड हमेशा के लिए हटा दिए गए।",
  "Role saved.": "भूमिका सेव हो गई।",
  "Invalid user.": "यूज़र सही नहीं है।",
  "Role removed. Active assignments were released.": "भूमिका हटा दी गई। उन्हें सौंपे गए चालू काम हटा दिए गए।",
  "Settings saved.": "सेटिंग्स सेव हो गईं।",
  "Removed requester contact details from {count} closed request(s) older than 90 days.":
    "90 दिन से पुरानी {count} बंद रिक्वेस्ट से माँगने वाले की संपर्क जानकारी हटा दी गई।",
  "Story status updated.": "कहानी की स्थिति बदल दी गई।",
  "Public presentation saved. The original submission is unchanged.": "सबको दिखने वाला रूप सेव हो गया। भेजी गई असली कहानी नहीं बदली।",
  "Invalid donation record.": "रक्तदान रिकॉर्ड सही नहीं है।",
  "Verification labels updated.": "पुष्टि के लेबल बदल दिए गए।",
  "This story has no photo the contributor agreed to publish.": "इस कहानी में ऐसी कोई फ़ोटो नहीं है जिसे दिखाने की सहमति भेजने वाले ने दी हो।",
  "The private photo could not be read.": "निजी फ़ोटो खोली नहीं जा सकी।",
  "The photo could not be published to public storage.": "फ़ोटो को सबके लिए अपलोड नहीं किया जा सका।",
  "Photo approved for publication. Turn on “Show photo” to display it.": "फ़ोटो दिखाने की मंज़ूरी मिल गई। इसे दिखाने के लिए “फ़ोटो दिखाएँ” चालू करें।",
  "Public photo removed.": "सबको दिखने वाली फ़ोटो हटा दी गई।",
  "Camp updated.": "कैंप की जानकारी बदल दी गई।",
  "Camp added.": "कैंप जोड़ दिया गया।",
  "Invalid camp.": "कैंप सही नहीं है।",
  "Camp removed.": "कैंप हटा दिया गया।",
  "Documented figure added.": "स्रोत वाला आँकड़ा जोड़ दिया गया।",
  "Invalid figure.": "आँकड़ा सही नहीं है।",
  "Figure removed.": "आँकड़ा हटा दिया गया।",

  // --- Validation: shared fields (src/lib/validation/common.ts) ----------------
  "Choose a blood group": "ब्लड ग्रुप चुनें",
  "Choose a donation type": "रक्तदान का प्रकार चुनें",
  "Choose what kind of donor is needed": "किस तरह का डोनर चाहिए, यह चुनें",
  "Choose the urgency": "कितनी जल्दी ज़रूरत है, यह चुनें",
  "Choose a contact method": "संपर्क का तरीका चुनें",
  "Choose one option": "एक विकल्प चुनें",
  "Choose a state or union territory": "राज्य या केंद्र शासित प्रदेश चुनें",
  "Invalid reference": "जानकारी सही नहीं है",
  "Please enter at least 2 characters": "कृपया कम से कम 2 अक्षर लिखें",
  "Please remove special characters such as < or >": "कृपया < या > जैसे खास चिह्न हटा दें",
  "Use at least 2 characters or leave blank": "कम से कम 2 अक्षर लिखें या खाली छोड़ दें",
  "Enter a valid email address": "सही ईमेल पता लिखें",
  "Enter a valid mobile number, e.g. 98765 43210": "सही मोबाइल नंबर लिखें, जैसे 98765 43210",
  "PIN codes have 6 digits and do not start with 0": "पिन कोड 6 अंकों का होता है और 0 से शुरू नहीं होता",
  "Choose a date": "तारीख चुनें",
  "Use at least 8 characters": "कम से कम 8 अक्षर रखें",
  "Use at most 72 characters": "ज़्यादा से ज़्यादा 72 अक्षर रखें",
  "Include at least one letter and one number": "कम से कम एक अक्षर और एक अंक ज़रूर रखें",

  // optionalText(max): "Please keep this under ${max} characters"
  "Please keep this under {max} characters": "कृपया इसे {max} अक्षरों से कम रखें",
  "Please keep this under 30 characters": "कृपया इसे 30 अक्षरों से कम रखें",
  "Please keep this under 60 characters": "कृपया इसे 60 अक्षरों से कम रखें",
  "Please keep this under 80 characters": "कृपया इसे 80 अक्षरों से कम रखें",
  "Please keep this under 100 characters": "कृपया इसे 100 अक्षरों से कम रखें",
  "Please keep this under 120 characters": "कृपया इसे 120 अक्षरों से कम रखें",
  "Please keep this under 200 characters": "कृपया इसे 200 अक्षरों से कम रखें",
  "Please keep this under 240 characters": "कृपया इसे 240 अक्षरों से कम रखें",
  "Please keep this under 280 characters": "कृपया इसे 280 अक्षरों से कम रखें",
  "Please keep this under 300 characters": "कृपया इसे 300 अक्षरों से कम रखें",
  "Please keep this under 500 characters": "कृपया इसे 500 अक्षरों से कम रखें",
  "Please keep this under 1000 characters": "कृपया इसे 1000 अक्षरों से कम रखें",
  "Please keep this under 2000 characters": "कृपया इसे 2000 अक्षरों से कम रखें",
  "Please keep this under 6000 characters": "कृपया इसे 6000 अक्षरों से कम रखें",

  // placeSchema(label, max): "Enter the ${label}" / "Please keep the ${label} under ${max} characters"
  "Enter the {label}": "{label} लिखें",
  "Enter the hospital, blood bank or centre": "अस्पताल, ब्लड बैंक या सेंटर का नाम लिखें",
  "Enter the hospital or blood bank": "अस्पताल या ब्लड बैंक का नाम लिखें",
  "Enter the district": "ज़िला लिखें",
  "Enter the city": "शहर लिखें",
  "Enter the city or town": "शहर या कस्बा लिखें",
  "Please keep the {label} under {max} characters": "कृपया {label} {max} अक्षरों से कम रखें",
  "Please keep the hospital, blood bank or centre under 150 characters": "कृपया अस्पताल, ब्लड बैंक या सेंटर का नाम 150 अक्षरों से कम रखें",
  "Please keep the hospital or blood bank under 150 characters": "कृपया अस्पताल या ब्लड बैंक का नाम 150 अक्षरों से कम रखें",
  "Please keep the district under 60 characters": "कृपया ज़िले का नाम 60 अक्षरों से कम रखें",
  "Please keep the city under 80 characters": "कृपया शहर का नाम 80 अक्षरों से कम रखें",
  "Please keep the city or town under 80 characters": "कृपया शहर या कस्बे का नाम 80 अक्षरों से कम रखें",

  // --- Validation: forms (src/lib/validation/forms.ts) -------------------------
  "Allow contact first to be marked as open to contact": "संपर्क के लिए तैयार दिखने से पहले संपर्क की अनुमति दें",
  "The date cannot be in the future": "तारीख आने वाले दिनों की नहीं हो सकती",
  "Check the year": "साल जाँच लें",
  "At least 1": "कम से कम 1",
  "Contact the blood bank for larger requirements": "इससे ज़्यादा ज़रूरत के लिए ब्लड बैंक से संपर्क करें",
  "Please confirm you have read how Rakt Response can help": "कृपया पक्का करें कि आपने पढ़ लिया है कि Rakt Response कैसे मदद कर सकता है",
  "Leave this field empty": "इस जगह को खाली छोड़ दें",
  "Add a phone number so a Rakt Mitra can reach you": "फ़ोन नंबर जोड़ें ताकि रक्त मित्र आपसे संपर्क कर सकें",
  "Add an email address": "ईमेल पता जोड़ें",
  "Write a note": "नोट लिखें",
  "Choose the kind of story": "कहानी का प्रकार चुनें",
  "Use at least 5 characters": "कम से कम 5 अक्षर लिखें",
  "Keep the title under 120 characters": "शीर्षक 120 अक्षरों से कम रखें",
  "Please write at least 80 characters": "कृपया कम से कम 80 अक्षर लिखें",
  "Please keep the story under 6000 characters": "कृपया कहानी 6000 अक्षरों से कम रखें",
  "Consent to publish is required to submit a story": "कहानी भेजने के लिए उसे प्रकाशित करने की सहमति ज़रूरी है",
  "Please confirm you have the right to share this content": "कृपया पक्का करें कि आपको यह सामग्री साझा करने का अधिकार है",
  "Share an email or phone so a reviewer can follow up privately": "ईमेल या फ़ोन नंबर दें ताकि समीक्षक आपसे निजी तौर पर बात कर सकें",
  "Verified figures can only be recorded for completed camps": "पुष्टि वाले आँकड़े सिर्फ़ पूरे हो चुके कैंप के लिए दर्ज हो सकते हैं",
  "Document where the verified figures come from": "लिखें कि पुष्टि वाले आँकड़े कहाँ से आए हैं",
  "Use lowercase letters, numbers and underscores": "सिर्फ़ छोटे अंग्रेज़ी अक्षर, अंक और अंडरस्कोर (_) इस्तेमाल करें",
  "Describe the source": "स्रोत के बारे में लिखें",
  "The period end must be after the start": "अवधि का अंत, शुरुआत के बाद होना चाहिए",
  "Fill in state, district and city together": "राज्य, ज़िला और शहर तीनों एक साथ भरें",

  // --- Validation: registration (src/lib/validation/registration.ts) -----------
  "You need to accept the privacy policy and terms to continue": "आगे बढ़ने के लिए प्राइवेसी नीति और शर्तें माननी होंगी",
  "Passwords do not match": "दोनों पासवर्ड एक जैसे नहीं हैं",
  "Choose your blood group": "अपना ब्लड ग्रुप चुनें",
  "Please confirm the age declaration to register as a donor": "डोनर के रूप में रजिस्टर करने के लिए कृपया उम्र वाली घोषणा पक्की करें",
  "Add a mobile number for phone or WhatsApp contact": "फ़ोन या WhatsApp संपर्क के लिए मोबाइल नंबर जोड़ें",
  "You can add up to 20 records now and more later": "अभी आप 20 रिकॉर्ड तक जोड़ सकते हैं, बाकी बाद में",
  "This looks like a duplicate of another entry": "यह किसी दूसरी एंट्री जैसी ही लगती है",
  "Choose your state": "अपना राज्य चुनें",
  "Enter your district": "अपना ज़िला लिखें",
  "Enter your city or town": "अपना शहर या कस्बा लिखें",
  "Enter your password": "अपना पासवर्ड लिखें",

  // --- Database errors (supabase/migrations: raise exception) ------------------
  "Donation date cannot be in the future": "रक्तदान की तारीख आने वाले दिनों की नहीं हो सकती",
  "Donation date is not plausible": "रक्तदान की तारीख सही नहीं लगती",
  "Verification and provenance fields can only be changed by an authorised reviewer": "पुष्टि और स्रोत की जानकारी सिर्फ़ अधिकृत समीक्षक बदल सकते हैं",
  "Request status and verification can only be changed through the coordination workflow":
    "रिक्वेस्ट की स्थिति और पुष्टि सिर्फ़ तालमेल की प्रक्रिया से बदली जा सकती है",
  "This request is already being reviewed. Please contact a Rakt Mitra to change it.":
    "इस रिक्वेस्ट की जाँच पहले से चल रही है। इसे बदलने के लिए कृपया रक्त मित्र से संपर्क करें।",
  "Only the read status of a notification can be changed": "सूचना में सिर्फ़ पढ़ी/नहीं पढ़ी की स्थिति बदली जा सकती है",
  "Audit logs are append-only": "ऑडिट लॉग में सिर्फ़ नई जानकारी जोड़ी जा सकती है",
  "Invalid rate limit": "सीमा की जानकारी सही नहीं है",
  "Sign in required": "साइन इन करना ज़रूरी है",
  "Invalid bucket": "स्टोरेज की जानकारी सही नहीं है",
  "Not authorised": "आपको इसकी अनुमति नहीं है",
  "Profile identity cannot be changed": "प्रोफ़ाइल की पहचान नहीं बदली जा सकती",
  "You cannot change protected profile fields": "आप प्रोफ़ाइल की सुरक्षित जानकारी नहीं बदल सकते",
  "Your blood group has been verified. Please request a correction instead.": "आपके ब्लड ग्रुप की पुष्टि हो चुकी है। कृपया इसकी जगह सुधार की रिक्वेस्ट भेजें।",
  "Your account email is managed through account settings": "आपके खाते का ईमेल खाते की सेटिंग्स से बदला जाता है",
  "You are not authorised to verify donation records": "आपको रक्तदान रिकॉर्ड जाँचने की अनुमति नहीं है",
  "Choose verified or rejected": "“पुष्टि हुई” या “नामंज़ूर” में से एक चुनें",
  "Donation record not found": "रक्तदान रिकॉर्ड नहीं मिला",
  "You cannot verify your own donation records": "आप अपने खुद के रक्तदान रिकॉर्ड नहीं जाँच सकते",
  "Please give a short reason when rejecting a record": "रिकॉर्ड नामंज़ूर करते समय कृपया छोटा-सा कारण लिखें",
  "Only administrators can verify donor profiles": "डोनर प्रोफ़ाइल की पुष्टि सिर्फ़ एडमिन कर सकते हैं",
  "You cannot verify your own profile": "आप अपनी खुद की प्रोफ़ाइल की पुष्टि नहीं कर सकते",
  "Profile not found": "प्रोफ़ाइल नहीं मिली",
  "Too many change requests today. Please try again tomorrow.": "आज बदलाव की बहुत ज़्यादा रिक्वेस्ट हो गईं। कृपया कल फिर से कोशिश करें।",
  "Only administrators can resolve blood group corrections": "ब्लड ग्रुप सुधार का फ़ैसला सिर्फ़ एडमिन कर सकते हैं",
  "There is no pending blood group correction for this profile": "इस प्रोफ़ाइल के लिए ब्लड ग्रुप सुधार की कोई रिक्वेस्ट बाकी नहीं है",
  "There is no pending deletion request to cancel": "रद्द करने के लिए खाता हटाने की कोई रिक्वेस्ट बाकी नहीं है",
  "Only administrators can change account status": "खाते की स्थिति सिर्फ़ एडमिन बदल सकते हैं",
  "You cannot deactivate your own account here": "आप यहाँ अपना खुद का खाता बंद नहीं कर सकते",
  "Only administrators can manage roles": "भूमिकाएँ सिर्फ़ एडमिन बदल सकते हैं",
  "You cannot change your own role": "आप अपनी खुद की भूमिका नहीं बदल सकते",
  "This account is not active": "यह खाता चालू नहीं है",
  "This person does not have an active staff role": "इस व्यक्ति के पास टीम की कोई चालू भूमिका नहीं है",
  "An administrator already exists. Use the admin panel to grant roles.": "एक एडमिन पहले से है। भूमिकाएँ देने के लिए एडमिन पैनल इस्तेमाल करें।",
  "No account found for that email. Register first, then run the bootstrap.": "इस ईमेल से कोई खाता नहीं मिला। पहले रजिस्टर करें, फिर bootstrap चलाएँ।",
  "Confirm the email address before making this account an administrator.": "इस खाते को एडमिन बनाने से पहले ईमेल की पुष्टि करें।",
  "Please sign in to submit a request": "रिक्वेस्ट भेजने के लिए कृपया साइन इन करें",
  "Too many requests from this connection today. For emergencies, contact the hospital blood bank directly.":
    "आज इस कनेक्शन से बहुत ज़्यादा रिक्वेस्ट आ चुकी हैं। इमरजेंसी में सीधे अस्पताल के ब्लड बैंक से संपर्क करें।",
  "Please share a phone number or email so a Rakt Mitra can reach you": "कृपया फ़ोन नंबर या ईमेल दें ताकि रक्त मित्र आपसे संपर्क कर सकें",
  "You have submitted several requests today. Please contact a Rakt Mitra for further help.":
    "आज आप कई रिक्वेस्ट भेज चुके हैं। और मदद के लिए कृपया रक्त मित्र से संपर्क करें।",
  "The required date and time must not be in the past": "ज़रूरत की तारीख और समय बीता हुआ नहीं हो सकता",
  "Requests can be planned at most 60 days ahead": "रिक्वेस्ट ज़्यादा से ज़्यादा 60 दिन आगे तक की ही हो सकती है",
  "Only authorised Rakt Mitras can update request status": "रिक्वेस्ट की स्थिति सिर्फ़ अधिकृत रक्त मित्र बदल सकते हैं",
  "Request not found": "रिक्वेस्ट नहीं मिली",
  'A request cannot move from "{from}" to "{to}"': "रिक्वेस्ट “{from}” से “{to}” में नहीं बदली जा सकती",
  "You are not authorised to verify requests": "आपको रिक्वेस्ट की पुष्टि करने की अनुमति नहीं है",
  "Please record a short reason or confirmation note": "कृपया छोटा-सा कारण या पुष्टि का नोट लिखें",
  "This request is already closed": "यह रिक्वेस्ट पहले ही बंद हो चुकी है",
  "Only authorised Rakt Mitras can take assignments": "रिक्वेस्ट सिर्फ़ अधिकृत रक्त मित्र ले सकते हैं",
  "Only administrators can assign other Rakt Mitras": "दूसरे रक्त मित्रों को काम सिर्फ़ एडमिन सौंप सकते हैं",
  "That person is not an active Rakt Mitra": "यह व्यक्ति चालू रक्त मित्र नहीं है",
  "This request is closed": "यह रिक्वेस्ट बंद है",
  "Assignment not found": "सौंपा गया काम नहीं मिला",
  "You can only update your own assignments": "आप सिर्फ़ अपने को सौंपे गए काम बदल सकते हैं",
  "Only authorised Rakt Mitras can record coordination": "तालमेल की जानकारी सिर्फ़ अधिकृत रक्त मित्र दर्ज कर सकते हैं",
  "Donor not found": "डोनर नहीं मिला",
  "Only authorised Rakt Mitras can search the donor directory": "डोनर सूची में सिर्फ़ अधिकृत रक्त मित्र खोज सकते हैं",
  "Only authorised Rakt Mitras can match donors": "डोनर मिलाने का काम सिर्फ़ अधिकृत रक्त मित्र कर सकते हैं",
  "Only authorised Rakt Mitras can access donor contact details": "डोनर की संपर्क जानकारी सिर्फ़ अधिकृत रक्त मित्र देख सकते हैं",
  "Contact details can only be accessed for a verified, active blood request":
    "संपर्क जानकारी सिर्फ़ ऐसी चालू खून की रिक्वेस्ट के लिए देखी जा सकती है जिसकी पुष्टि हो चुकी हो",
  "This donor is not available": "यह डोनर उपलब्ध नहीं है",
  "This donor has not agreed to be contacted directly. Send a contact request instead.":
    "इस डोनर ने सीधे संपर्क की सहमति नहीं दी है। इसकी जगह संपर्क रिक्वेस्ट भेजें।",
  "You have reached the hourly limit for viewing contact details. Please try again later.":
    "संपर्क जानकारी देखने की एक घंटे की सीमा पूरी हो गई है। कृपया बाद में फिर से कोशिश करें।",
  "Only authorised Rakt Mitras can send contact requests": "संपर्क रिक्वेस्ट सिर्फ़ अधिकृत रक्त मित्र भेज सकते हैं",
  "Contact requests can only be sent for a verified, active blood request":
    "संपर्क रिक्वेस्ट सिर्फ़ ऐसी चालू खून की रिक्वेस्ट के लिए भेजी जा सकती है जिसकी पुष्टि हो चुकी हो",
  "This donor is not available in the directory": "यह डोनर सूची में उपलब्ध नहीं है",
  "A contact request is already waiting for this donor": "इस डोनर के लिए एक संपर्क रिक्वेस्ट पहले से बाकी है",
  "This donor declined to share contact details for this request": "इस डोनर ने इस रिक्वेस्ट के लिए संपर्क जानकारी देने से मना किया है",
  "You have sent many contact requests in the last hour. Please try again later.":
    "पिछले एक घंटे में आपने बहुत सारी संपर्क रिक्वेस्ट भेजी हैं। कृपया बाद में फिर से कोशिश करें।",
  "Contact request not found": "संपर्क रिक्वेस्ट नहीं मिली",
  "This contact request is no longer open": "यह संपर्क रिक्वेस्ट अब खुली नहीं है",
  "This contact request has expired": "इस संपर्क रिक्वेस्ट का समय खत्म हो गया है",
  "Choose a response": "एक जवाब चुनें",
  "Complete your donor profile to respond to requests": "रिक्वेस्ट का जवाब देने के लिए अपनी डोनर प्रोफ़ाइल पूरी करें",
  "This request is not open for responses": "यह रिक्वेस्ट अब जवाब के लिए खुली नहीं है",
  "Only administrators can view analytics": "आँकड़े सिर्फ़ एडमिन देख सकते हैं",
  "Invalid audit action": "ऑडिट की जानकारी सही नहीं है",
  "Keep closed-request contacts for at least 7 days": "बंद रिक्वेस्ट की संपर्क जानकारी कम से कम 7 दिन रखें",
  "Please sign in to share your story": "अपनी कहानी बताने के लिए कृपया साइन इन करें",
  "Stories are shared for publication. Please give consent to publish, or contact us privately instead.":
    "कहानियाँ प्रकाशित करने के लिए ली जाती हैं। कृपया प्रकाशित करने की सहमति दें, या इसकी जगह हमसे निजी तौर पर संपर्क करें।",
  "Rakt Mitra stories can be submitted by authorised Rakt Mitras": "रक्त मित्र की कहानियाँ सिर्फ़ अधिकृत रक्त मित्र भेज सकते हैं",
  "Invalid photo reference": "फ़ोटो की जानकारी सही नहीं है",
  "Camp not found": "कैंप नहीं मिला",
  "You have shared several stories today. Please try again tomorrow.": "आज आप कई कहानियाँ भेज चुके हैं। कृपया कल फिर से कोशिश करें।",
  "Story not found": "कहानी नहीं मिली",
  "This story has been withdrawn": "यह कहानी वापस ले ली गई है",
  "Please describe the correction you need": "कृपया बताएँ कि आपको क्या सुधार चाहिए",
  "Too many correction requests today": "आज सुधार की बहुत ज़्यादा रिक्वेस्ट हो गईं",
  "Only administrators can moderate stories": "कहानियों की जाँच सिर्फ़ एडमिन कर सकते हैं",
  "A story cannot move from {from} to {to}": "कहानी {from} से {to} स्थिति में नहीं जा सकती",
  "Please record the reason for this decision": "कृपया इस फ़ैसले का कारण लिखें",
  "This story cannot be published without the contributor's current consent": "भेजने वाले की मौजूदा सहमति के बिना यह कहानी प्रकाशित नहीं हो सकती",
  "Only administrators can edit stories": "कहानियाँ सिर्फ़ एडमिन बदल सकते हैं",
  "You can only display details the contributor consented to share": "आप सिर्फ़ वही जानकारी दिखा सकते हैं जिसकी सहमति भेजने वाले ने दी है",
  "Only administrators can set verification labels": "पुष्टि के लेबल सिर्फ़ एडमिन लगा सकते हैं",
  "Link a verified donation record belonging to the contributor first": "पहले भेजने वाले का कोई पुष्टि वाला रक्तदान रिकॉर्ड जोड़ें",
  "Only administrators can publish photos": "फ़ोटो सिर्फ़ एडमिन प्रकाशित कर सकते हैं",
  "The contributor has not consented to a public photo": "भेजने वाले ने फ़ोटो सबको दिखाने की सहमति नहीं दी है",
  "Invalid public photo name": "फ़ोटो का नाम सही नहीं है",
  "Only administrators can process deletion requests": "खाता हटाने की रिक्वेस्ट सिर्फ़ एडमिन पूरी कर सकते हैं",
  "You cannot process your own deletion request": "आप अपनी खुद की खाता हटाने की रिक्वेस्ट पूरी नहीं कर सकते",
  "Only administrators can run data checks": "डेटा जाँच सिर्फ़ एडमिन चला सकते हैं",

  // --- Notifications written by the database (supabase/migrations) -------------
  // Donation record review
  "A donation record was verified": "एक रक्तदान रिकॉर्ड की पुष्टि हुई",
  "A donation record could not be verified": "एक रक्तदान रिकॉर्ड की पुष्टि नहीं हो पाई",
  "Your SDP record dated {date} was reviewed. Reason: {reason}": "{date} के आपके SDP रिकॉर्ड की जाँच हो गई है। कारण: {reason}",
  "Your whole blood record dated {date} was reviewed. Reason: {reason}": "{date} के आपके होल ब्लड रिकॉर्ड की जाँच हो गई है। कारण: {reason}",
  "Your donation record dated {date} was reviewed. Reason: {reason}": "{date} के आपके रक्तदान रिकॉर्ड की जाँच हो गई है। कारण: {reason}",
  "Your SDP record dated {date} was reviewed.": "{date} के आपके SDP रिकॉर्ड की जाँच हो गई है।",
  "Your whole blood record dated {date} was reviewed.": "{date} के आपके होल ब्लड रिकॉर्ड की जाँच हो गई है।",
  "Your donation record dated {date} was reviewed.": "{date} के आपके रक्तदान रिकॉर्ड की जाँच हो गई है।",

  // Profile verification, blood group corrections, roles
  "Your donor profile is verified": "आपकी डोनर प्रोफ़ाइल की पुष्टि हो गई",
  "Your donor profile could not be verified": "आपकी डोनर प्रोफ़ाइल की पुष्टि नहीं हो पाई",
  "Your donor profile is being reviewed": "आपकी डोनर प्रोफ़ाइल की जाँच चल रही है",
  "Your profile verification status changed": "आपकी प्रोफ़ाइल की पुष्टि की स्थिति बदल गई",
  "Verification confirms the details you shared with our team. It is not a medical eligibility decision.":
    "पुष्टि का मतलब है कि आपने हमारी टीम को जो जानकारी दी, वह जाँची गई है। यह रक्तदान की मेडिकल योग्यता का फ़ैसला नहीं है।",
  "Your blood group correction was approved": "आपके ब्लड ग्रुप का सुधार मंज़ूर हो गया",
  "Your blood group correction was not approved": "आपके ब्लड ग्रुप का सुधार मंज़ूर नहीं हुआ",
  "Please contact the Rakt Response team if you believe this is a mistake.": "अगर आपको लगता है कि यह गलती है, तो कृपया Rakt Response टीम से संपर्क करें।",
  "Blood group correction requested": "ब्लड ग्रुप सुधार की रिक्वेस्ट आई",
  "A donor with a verified blood group asked for a correction. Review it in the donor admin area.":
    "पुष्टि वाले ब्लड ग्रुप के एक डोनर ने सुधार माँगा है। इसे एडमिन के डोनर सेक्शन में देखें।",
  "Account deletion requested": "खाता हटाने की रिक्वेस्ट आई",
  "A member asked for their account to be deleted. Process it from the donor admin area.":
    "एक सदस्य ने अपना खाता हटाने को कहा है। इसे एडमिन के डोनर सेक्शन से पूरा करें।",
  "You are now a Rakt Response administrator": "अब आप Rakt Response के एडमिन हैं",
  "You are now a Rakt Mitra": "अब आप Rakt Response के रक्त मित्र हैं",
  "Please handle donor information only for legitimate coordination and follow the team privacy guidelines.":
    "डोनर की जानकारी सिर्फ़ सही तालमेल के काम के लिए इस्तेमाल करें और टीम के प्राइवेसी नियमों का पालन करें।",
  "Your email is verified": "आपके ईमेल की पुष्टि हो गई",
  "Welcome to Rakt Response! Your donor profile is now marked as verified. Review your privacy choices any time in Settings.":
    "Rakt Response में आपका स्वागत है! आपकी डोनर प्रोफ़ाइल अब पुष्टि वाली मार्क हो गई है। अपनी प्राइवेसी पसंद कभी भी सेटिंग्स में देख सकते हैं।",

  // Request status updates for the requester ("Request RR-…: <status label>")
  "Request {code}: Draft": "रिक्वेस्ट {code}: ड्राफ़्ट",
  "Request {code}: Submitted": "रिक्वेस्ट {code}: भेजी गई",
  "Request {code}: Under verification": "रिक्वेस्ट {code}: जाँच चल रही है",
  "Request {code}: Verified": "रिक्वेस्ट {code}: जाँच हो चुकी",
  "Request {code}: In coordination": "रिक्वेस्ट {code}: तालमेल चल रहा है",
  "Request {code}: Fulfilled": "रिक्वेस्ट {code}: पूरी हुई",
  "Request {code}: Cancelled": "रिक्वेस्ट {code}: रद्द",
  "Request {code}: Expired": "रिक्वेस्ट {code}: समय खत्म",
  "Request {code}: Not verified": "रिक्वेस्ट {code}: पुष्टि नहीं हुई",
  "A Rakt Mitra verified your request and is looking for donors. Keep in touch with the hospital blood bank.":
    "एक रक्त मित्र ने आपकी रिक्वेस्ट की पुष्टि की है और डोनर ढूँढ रहे हैं। अस्पताल के ब्लड बैंक से संपर्क में रहें।",
  "Rakt Mitras are coordinating with potential donors.": "रक्त मित्र ऐसे डोनरों से बात कर रहे हैं जो मदद कर सकते हैं।",
  "We could not verify this request.": "हम इस रिक्वेस्ट की पुष्टि नहीं कर पाए।",
  "We could not verify this request. ": "हम इस रिक्वेस्ट की पुष्टि नहीं कर पाए।",
  "We could not verify this request. {reason}": "हम इस रिक्वेस्ट की पुष्टि नहीं कर पाए। {reason}",

  // New requests for reviewers (longer variant first: templates match in order)
  "New {group} whole blood request": "नई {group} होल ब्लड रिक्वेस्ट",
  "New {group} SDP (single donor platelets) request": "नई {group} SDP (एक डोनर से प्लेटलेट्स) रिक्वेस्ट",
  "New {group} apheresis request": "नई {group} एफ़ेरेसिस रिक्वेस्ट",
  "Needs verification: {hospital}, {city}. Possible duplicate — please check.":
    "पुष्टि बाकी: {hospital}, {city}। यह किसी दूसरी रिक्वेस्ट जैसी लगती है — कृपया जाँच लें।",
  "Needs verification: {hospital}, {city}.": "पुष्टि बाकी: {hospital}, {city}।",

  // Alerts to matching donors
  "Verified {group} whole blood request in {city}": "{city} में {group} होल ब्लड की रिक्वेस्ट (पुष्टि हुई)",
  "Verified {group} SDP (single donor platelets) request in {city}": "{city} में {group} SDP (एक डोनर से प्लेटलेट्स) की रिक्वेस्ट (पुष्टि हुई)",
  "Verified {group} apheresis request in {city}": "{city} में {group} एफ़ेरेसिस की रिक्वेस्ट (पुष्टि हुई)",
  "Needed by {when} at {hospital}. Respond only if you are currently able to donate — the blood centre will confirm your eligibility.":
    "{hospital} में {when} तक ज़रूरत है। जवाब तभी दें जब आप अभी रक्तदान कर सकते हों — ब्लड बैंक आपकी योग्यता की पुष्टि करेगा।",

  // Volunteer assignments and follow-ups
  "You were assigned request {code}": "आपको रिक्वेस्ट {code} सौंपी गई है",
  "{group} whole blood at {hospital}": "{hospital} में {group} होल ब्लड",
  "{group} SDP (single donor platelets) at {hospital}": "{hospital} में {group} SDP (एक डोनर से प्लेटलेट्स)",
  "{group} apheresis at {hospital}": "{hospital} में {group} एफ़ेरेसिस",
  "Follow-up due: {code}": "फ़ॉलो-अप का समय: {code}",
  "Check in on the {group} request at {hospital}.": "{hospital} वाली {group} रिक्वेस्ट की खबर लें।",
  "A donor is interested in {code}": "एक डोनर {code} के लिए तैयार है",
  "Check the request page to coordinate. Interest is not a confirmed donation.": "तालमेल के लिए रिक्वेस्ट वाला पेज देखें। तैयार होने का मतलब पक्का रक्तदान नहीं है।",

  // Contact requests
  "Can a Rakt Mitra contact you about a {group} request?": "क्या कोई रक्त मित्र {group} रिक्वेस्ट के बारे में आपसे संपर्क कर सकता है?",
  "A verified whole blood request at {hospital}, {city}. Accept only if you are willing to be contacted — you can decline without giving a reason.":
    "{hospital}, {city} में होल ब्लड की रिक्वेस्ट (पुष्टि हुई)। हाँ तभी कहें जब आप संपर्क के लिए तैयार हों — आप बिना कारण बताए मना कर सकते हैं।",
  "A verified SDP (single donor platelets) request at {hospital}, {city}. Accept only if you are willing to be contacted — you can decline without giving a reason.":
    "{hospital}, {city} में SDP (एक डोनर से प्लेटलेट्स) की रिक्वेस्ट (पुष्टि हुई)। हाँ तभी कहें जब आप संपर्क के लिए तैयार हों — आप बिना कारण बताए मना कर सकते हैं।",
  "A verified apheresis request at {hospital}, {city}. Accept only if you are willing to be contacted — you can decline without giving a reason.":
    "{hospital}, {city} में एफ़ेरेसिस की रिक्वेस्ट (पुष्टि हुई)। हाँ तभी कहें जब आप संपर्क के लिए तैयार हों — आप बिना कारण बताए मना कर सकते हैं।",
  "A donor accepted your contact request": "एक डोनर ने आपकी संपर्क रिक्वेस्ट मान ली",
  "A donor declined your contact request": "एक डोनर ने आपकी संपर्क रिक्वेस्ट मना कर दी",
  "Request {code}. You can now view their contact details from the request page.":
    "रिक्वेस्ट {code}। अब आप रिक्वेस्ट वाले पेज पर उनकी संपर्क जानकारी देख सकते हैं।",
  "Request RR-{code}.": "रिक्वेस्ट RR-{code}।",

  // Stories
  "Your story is now published": "आपकी कहानी अब प्रकाशित हो गई है",
  "Your story is no longer public": "आपकी कहानी अब सबको नहीं दिखती",
  "Your story was not approved": "आपकी कहानी मंज़ूर नहीं हुई",
  "We need a little more information about your story": "हमें आपकी कहानी के बारे में थोड़ी और जानकारी चाहिए",
  "Your story was approved": "आपकी कहानी मंज़ूर हो गई",
  "Your story is being reviewed": "आपकी कहानी की जाँच चल रही है",
  "Your story status changed": "आपकी कहानी की स्थिति बदल गई",
  "New story submitted for review": "जाँच के लिए नई कहानी आई",
  "A donor story is waiting for moderation.": "एक डोनर की कहानी जाँच का इंतज़ार कर रही है।",
  "A attendant story is waiting for moderation.": "मरीज़ के परिजन की एक कहानी जाँच का इंतज़ार कर रही है।",
  "A recipient story is waiting for moderation.": "खून पाने वाले की एक कहानी जाँच का इंतज़ार कर रही है।",
  "A Rakt Mitra story is waiting for moderation.": "एक रक्त मित्र की कहानी जाँच का इंतज़ार कर रही है।",
  "A camp story is waiting for moderation.": "एक कैंप की कहानी जाँच का इंतज़ार कर रही है।",
  "A {type} story is waiting for moderation.": "एक {type} कहानी जाँच का इंतज़ार कर रही है।",
  "A contributor narrowed their consent": "कहानी भेजने वाले ने अपनी सहमति कम कर दी",
  "Public display has been reduced automatically. Check any public photo that may need removing.":
    "सबको दिखने वाली जानकारी अपने-आप कम कर दी गई है। देख लें कि कोई फ़ोटो हटानी तो नहीं है।",
  "A story was withdrawn by its contributor": "भेजने वाले ने एक कहानी वापस ले ली",
  "It is no longer public.": "अब यह सबको नहीं दिखती।",
  "It is no longer public. A public photo may still need to be deleted from storage.":
    "अब यह सबको नहीं दिखती। हो सकता है कोई फ़ोटो अभी भी स्टोरेज से हटानी हो।",
  "Story correction requested": "कहानी में सुधार की रिक्वेस्ट आई",
  "A contributor asked for a correction to their story.": "भेजने वाले ने अपनी कहानी में सुधार माँगा है।",

  // Request timeline notes (request_events)
  "Rakt Mitra took the request": "रक्त मित्र ने रिक्वेस्ट ली",
  "Rakt Mitra assigned by an administrator": "एडमिन ने रक्त मित्र को काम सौंपा",
  "Contact request sent to a donor": "डोनर को संपर्क रिक्वेस्ट भेजी गई",
  "Donor accepted a contact request": "डोनर ने संपर्क रिक्वेस्ट मान ली",
  "Donor declined a contact request": "डोनर ने संपर्क रिक्वेस्ट मना की",
  "Possible duplicate of an open request at the same hospital": "उसी अस्पताल की किसी खुली रिक्वेस्ट जैसी लगती है",
  "Donor response: interested": "डोनर का जवाब: तैयार हूँ",
  "Donor response: unavailable": "डोनर का जवाब: अभी उपलब्ध नहीं",
  "Donor response: declined": "डोनर का जवाब: मना किया",
  "Donor response: no_response": "डोनर का जवाब: कोई जवाब नहीं",

  // --- Patients and donors (18 October 2026) -----------------------------------------
  "You're marked as available to donate.":
    "आप रक्तदान के लिए उपलब्ध दिखाए जा रहे हैं।",
  "You're marked as unavailable. Patients and Rakt Mitras won't contact you.":
    "आप उपलब्ध नहीं दिखाए जा रहे। मरीज़ और रक्त मित्र आपसे संपर्क नहीं करेंगे।",
  "Thank you for joining. Open the request to see the patient's details and contact the family.":
    "जुड़ने के लिए धन्यवाद। मरीज़ की जानकारी देखने और परिवार से संपर्क करने के लिए रिक्वेस्ट खोलें।",
  "This donor is not available for your request":
    "यह डोनर आपकी रिक्वेस्ट के लिए उपलब्ध नहीं है",
  "Contact shown.":
    "संपर्क दिखाया गया।",
  "This request is not yours":
    "यह रिक्वेस्ट आपकी नहीं है",
  "You have opened many donor contacts this month. Please contact a Rakt Mitra for more help.":
    "इस महीने आपने कई डोनर संपर्क खोले हैं। और मदद के लिए किसी रक्त मित्र से संपर्क करें।",
  "You have opened many donor contacts in the last hour. Please try again later.":
    "पिछले एक घंटे में आपने कई डोनर संपर्क खोले हैं। कृपया थोड़ी देर बाद कोशिश करें।",
  "You cannot join your own request":
    "आप अपनी ही रिक्वेस्ट से नहीं जुड़ सकते",
  "This request needs a different blood group":
    "इस रिक्वेस्ट के लिए दूसरा ब्लड ग्रुप चाहिए",
  "Your last donation was too recent to join this request":
    "आपका पिछला रक्तदान हाल ही में हुआ है, इसलिए आप इस रिक्वेस्ट से नहीं जुड़ सकते",
  "You have joined several open requests. Finish or leave one before joining another.":
    "आप कई खुली रिक्वेस्ट से जुड़े हैं। किसी और से जुड़ने से पहले एक पूरी करें या उससे हटें।",
  "You have joined several requests today. Please try again tomorrow.":
    "आज आप कई रिक्वेस्ट से जुड़ चुके हैं। कृपया कल कोशिश करें।",
  "You already have open requests. Close one, or contact a Rakt Mitra, before adding another.":
    "आपकी पहले से खुली रिक्वेस्ट हैं। नई जोड़ने से पहले एक बंद करें, या किसी रक्त मित्र से संपर्क करें।",
  "Only a Rakt Mitra can change these details. Please contact a Rakt Mitra.":
    "यह जानकारी सिर्फ़ रक्त मित्र बदल सकते हैं। कृपया किसी रक्त मित्र से संपर्क करें।",
  "A donor is ready to give for {code}":
    "{code} के लिए एक डोनर रक्तदान को तैयार है",
  "Open your request to see them. The blood centre will check their eligibility.":
    "उन्हें देखने के लिए अपनी रिक्वेस्ट खोलें। ब्लड सेंटर उनकी योग्यता जाँचेगा।",
  "A Rakt Mitra verified your request. Open it to see donors who can give now, and keep in touch with the hospital blood bank.":
    "रक्त मित्र ने आपकी रिक्वेस्ट जाँच ली है। अभी रक्तदान कर सकने वाले डोनर देखने के लिए इसे खोलें, और अस्पताल के ब्लड बैंक के संपर्क में रहें।",
  "Enter the patient's name":
    "मरीज़ का नाम लिखें",
  "Please keep the name under 100 characters":
    "नाम 100 अक्षरों से छोटा रखें",
  "Enter the patient's age":
    "मरीज़ की उम्र लिखें",
  "Enter the age in years":
    "उम्र सालों में लिखें",
  "Choose one":
    "एक चुनें",
  "How many units are needed?":
    "कितनी यूनिट चाहिए?",
  "Choose your relation to the patient":
    "मरीज़ से अपना रिश्ता चुनें",
  "Choose how donors can reach you":
    "चुनें कि डोनर आप तक कैसे पहुँचें",

  // --- After donation (database, 18 October 2026) ------------------------------------
  "Follow up after donation: {code}":
    "रक्तदान के बाद हाल-चाल: {code}",
  "A donor gave blood for this request. Check on them and thank them, then mark it done.":
    "एक डोनर ने इस रिक्वेस्ट के लिए रक्तदान किया। उनका हाल-चाल लें और धन्यवाद दें, फिर इसे पूरा मार्क करें।",
  "Thank you for giving blood for {code}. Add it to your donation record so we know when you can give again.":
    "{code} के लिए रक्तदान करने का धन्यवाद। इसे अपने रक्तदान रिकॉर्ड में जोड़ें, ताकि पता रहे कि आप फिर कब रक्तदान कर सकते हैं।",
  "Thank you for giving blood for {code}. It is in your donation record. A Rakt Mitra may check in with you.":
    "{code} के लिए रक्तदान करने का धन्यवाद। यह आपके रक्तदान रिकॉर्ड में है। कोई रक्त मित्र आपका हाल-चाल ले सकता है।",
  "You can only tell us about requests you joined":
    "आप सिर्फ़ उन्हीं रिक्वेस्ट के बारे में बता सकते हैं जिनसे आप जुड़े थे",
  "This request has closed. Add the donation from your donation history instead.":
    "यह रिक्वेस्ट बंद हो चुकी है। रक्तदान को अपने रक्तदान इतिहास में खुद जोड़ें।",
  "You already told us you donated for this request":
    "आप पहले ही बता चुके हैं कि आपने इस रिक्वेस्ट के लिए रक्तदान किया",
  "That date is before this request was made":
    "यह तारीख रिक्वेस्ट बनने से पहले की है",
  "Only authorised Rakt Mitras can record follow-ups":
    "सिर्फ़ अधिकृत रक्त मित्र ही हाल-चाल दर्ज कर सकते हैं",
  "Please keep the note under 500 characters":
    "नोट 500 अक्षरों से कम रखें",
  "There is no follow-up waiting for this donor":
    "इस डोनर का कोई हाल-चाल बाकी नहीं है",
  "Donor reported donating":
    "डोनर ने रक्तदान की जानकारी दी",
  "Donor said they did not donate":
    "डोनर ने बताया कि रक्तदान नहीं किया",
  "Followed up with a donor after their donation":
    "रक्तदान के बाद डोनर का हाल-चाल लिया",
};

export default hi;
