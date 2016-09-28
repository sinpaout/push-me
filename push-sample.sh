# checking validity of and API key

export apikey=
export regid=dlNkc4Hhc9c:APA91bF8XQ1PQ2axTmVodiKUSeiyJdpvHcJgOnUu671_I7pWEymSfuCufgDbPFsuEvJmc8uTTEN_ghdJy2cdkPeSt3XGeL50Hn3yHhkgm3cLzc-baPgKMf7maB8LIVCOGUmZhcfo0uXz

curl --header 'Authorization: key='$apikey --header 'Content-Type: application/json' https://android.googleapis.com/gcm/send -d '{"registration_ids":["'$regid'"]}'

# send to sync

curl \
--header 'Authorization: key='$apikey \
--header 'Content-Type: application/json' \
https://android.googleapis.com/gcm/send \
-d '{"to":"'$regid'"}'

# notification message

curl \
--header 'Authorization: key='$apikey \
--header 'Content-Type: application/json' \
https://android.googleapis.com/gcm/send \
-d '{"notification": {"title": "Portugal vs. Denmark", "text": "5 to 1"}, "to":"'$regid'"}'

# data
curl \
--header 'Authorization: key='$apikey \
--header 'Content-Type: application/json' \
https://android.googleapis.com/gcm/send \
-d '{"to":"'$regid'", "data": {"score": "4x8", "time": "15:16:17.189"}}'

# AIzaSyBPwHAHMuXEBEH_UeIrUfjIxxccjC7qe4M

# dVwoUNia3vw:APA91bF1r8QNc3pcXw3IHlo-QgOLcMM9FRVF3SYecVYPD2IyrT_9FGJZB5o7koO_IxO3CW5JIwpcl_hBB6c-l_GJsSPo7QsdMcBVS_q7SpcFJQy72782l025U0HwG1rrBZzH5v6MFKQB