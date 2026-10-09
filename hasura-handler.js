<!DOCTYPE html>
<html>
<head>
    <title>Farmer Profile</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

    <style>

    *{
        margin:0;
        padding:0;
        box-sizing:border-box;
        font-family:'Inter', Arial, sans-serif;
    }

    body{
        min-height:100vh;
        background: url('images/farm.jpg') center / cover no-repeat fixed;
        display:flex;
        justify-content:center;
        align-items:center;
        padding:100px 16px 30px;
    }

    .topbar{
        position:fixed;
        top:0;
        left:0;
        right:0;
        height:72px;
        z-index:20;
        background:#2e7d32;
        display:flex;
        align-items:center;
        padding:0 40px;
        box-shadow:0 4px 14px rgba(0,0,0,0.25);
    }

    .brand{
        display:flex;
        flex-direction:column;
        align-items:flex-start;
        gap:5px;
        text-decoration:none;
    }

    .brand-top{
        display:flex;
        align-items:center;
        gap:8px;
    }

    .brand-icon{
        width:32px;
        height:32px;
        display:flex;
        align-items:center;
        justify-content:center;
        filter:drop-shadow(0 1px 0 rgba(255,255,255,0.3));
    }

    .brand-icon svg{
        width:100%;
        height:100%;
    }

    .brand-text{
        font-family:'Poppins',Arial,sans-serif;
        font-size:26px;
        font-weight:700;
        color:#ffffff;
        letter-spacing:.3px;
        line-height:1;
    }

    .brand-text span{
        font-family:inherit;
        color:#d4f78f;
        text-shadow:0 1px 2px rgba(0,0,0,0.25);
    }

    .brand-tagline{
        font-family:'Poppins',Arial,sans-serif;
        font-size:10px;
        font-weight:600;
        color:rgba(255,255,255,0.9);
        letter-spacing:.7px;
        text-transform:uppercase;
        line-height:1;
        margin-left:40px;
    }

    @media (max-width:768px){
        body{ background-attachment: scroll; }
    }

    @media (max-width:480px){
        .topbar{ height:64px; padding:0 16px; }
        body{ padding-top:90px; }
        .brand-text{ font-size:22px; }
        .brand-icon{ width:28px; height:28px; }
        .brand-tagline{ font-size:8px; margin-left:36px; }
    }


    .profile-box{
        position:relative;
        width:380px;
        background:rgba(255,255,255,0.92);
        border-radius:26px;
        padding:34px 30px 30px;
        text-align:center;
        border:1px solid rgba(255,255,255,0.6);
        box-shadow:0 20px 45px rgba(20,50,20,0.35), 0 2px 6px rgba(20,50,20,0.12);
    }

    .back-arrow{
        margin-left:auto;
        width:34px;
        height:34px;
        border-radius:50%;
        background:#e8f5e9;
        color:#1b5e20;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:18px;
        text-decoration:none;
        cursor:pointer;
        transition:transform .15s ease, background .15s ease;
    }

    .back-arrow:hover{
        background:#cfe8d0;
        transform:translateX(-2px);
    }

    .profile-img{
        display:block;
        margin:0 auto;
        width:130px;
        height:130px;
        border-radius:50%;
        object-fit:cover;
        border:5px solid #2e7d32;
        box-shadow:0 8px 18px rgba(0,0,0,0.2);
    }

    .profile-img-placeholder{
        width:130px;
        height:130px;
        border-radius:50%;
        margin:0 auto;
        border:5px solid #cfe3cf;
        background:#eef6ec;
        color:#7fa876;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:52px;
        box-shadow:0 8px 18px rgba(0,0,0,0.12);
    }

    h2{
        font-family:'Poppins', Arial, sans-serif;
        color:#1b5e20;
        margin:15px;
        letter-spacing:.2px;
    }

    .details{
        margin-top:20px;
    }

    .card{
        background:#f1f8e9;
        padding:12px 14px;
        margin:10px 0;
        border-radius:12px;
        text-align:left;
        border-left:3px solid #2e7d32;
        transition:transform .12s ease, box-shadow .12s ease;
    }

    .card:hover{
        transform:translateX(2px);
        box-shadow:0 4px 10px rgba(27,94,32,0.12);
    }

    button{
        background:linear-gradient(135deg,#43a047,#1b5e20);
        color:white;
        border:none;
        padding:12px 30px;
        border-radius:20px;
        margin-top:15px;
        font-size:15px;
        font-weight:600;
        cursor:pointer;
        box-shadow:0 6px 16px rgba(27,94,32,0.35);
        transition:transform .12s ease, box-shadow .12s ease;
    }

    button:hover{
        transform:translateY(-1px);
        box-shadow:0 8px 20px rgba(27,94,32,0.42);
    }

    button:active{
        transform:translateY(0);
    }

    .load-msg{
        font-size:13px;
        color:#1b5e20;
        margin-bottom:6px;
    }

    </style>

</head>


<body>

<div class="topbar">
    <a href="dashboard.html" class="brand">
        <span class="brand-top">
            <span class="brand-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#d4f78f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 21v-8"/>
                    <path d="M12 13c-4 0-6-2-6-6 4 0 6 2 6 6z"/>
                    <path d="M12 11c0-4 2-6 6-6 0 4-2 6-6 6z"/>
                </svg>
            </span>
            <span class="brand-text">Agri<span>Nova</span></span>
        </span>
        <span class="brand-tagline">Smart Agriculture Management System</span>
    </a>

    <a href="dashboard.html" class="back-arrow" title="Back to dashboard">&#8592;</a>
</div>


<div class="profile-box">

<div class="load-msg" id="loadMsg">Loading your profile…</div>

<img id="profileImage" class="profile-img" style="display:none;">
<div id="profileImagePlaceholder" class="profile-img-placeholder">👤</div>


<h2>Farmer Profile</h2>


<div class="details">

<div class="card" id="displayName">👤 Name : —</div>

<div class="card" id="displayDob">🎂 Date of Birth : —</div>

<div class="card" id="displayAge">🔢 Age : —</div>

<div class="card" id="displayGender">⚧ Gender : —</div>

<div class="card" id="displayPhone">📞 Phone : —</div>

<div class="card" id="displayLocation">📍 Location : —</div>

<div class="card" id="displayFarm">🌾 Farm Area : —</div>

<div class="card" id="displaySoil">🪨 Soil Type : —</div>

<div class="card" id="displayCrop">🌱 Main Crop : —</div>

<div class="card" id="displayIrrigation">💧 Irrigation : —</div>

</div>


<button onclick="openEditProfile()">Edit Profile</button>


</div>


<script type="module">

// ===== SETTINGS - ithu rendu mattum unga project-ku maathunga =====
const API_BASE   = "https://YOUR-BACKEND.onrender.com";   // unga Render backend URL
const LOGIN_PAGE = "login.html";                           // unga login page peru

// Logged-in farmer-oda "owner" (email). Unga login page save panra key-a inga match pannunga.
function getOwner(){
    const keys = ["email", "userEmail", "farmerEmail", "loggedInEmail", "user_email"];
    for(const k of keys){
        const v = (localStorage.getItem(k) || "").trim();
        if(v) return v.toLowerCase();
    }
    return "";
}

function openEditProfile(){
    window.location.href = "edit-farmer-profile.html";
}
window.openEditProfile = openEditProfile;

function fieldOrDash(value){
    return value && value.toString().trim() !== "" ? value : "—";
}

function genderLabel(value){
    if(value === "male") return "Male";
    if(value === "female") return "Female";
    return "—";
}

function calculateAge(dobString){

    let dob = new Date(dobString);
    let today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    let hasHadBirthdayThisYear =
        (today.getMonth() > dob.getMonth()) ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    if(!hasHadBirthdayThisYear){
        age--;
    }

    return age;
}

// Keeps localStorage in sync so other pages (dashboard etc.) that still read
// localStorage keep working. Source of truth = database.
function mirrorToLocal(d){
    ["name","dob","age","gender","phone","countryCode","address","farm","soil","crop","irrigation","profileImage"].forEach(k => {
        if(d[k] !== undefined && d[k] !== null && d[k] !== ""){
            try{ localStorage.setItem(k, d[k]); }catch(e){}
        }else{
            localStorage.removeItem(k);
        }
    });
}

function render(d){

    document.getElementById("displayName").innerHTML = "👤 Name : " + fieldOrDash(d.name);
    document.getElementById("displayDob").innerHTML = "🎂 Date of Birth : " + fieldOrDash(d.dob);
    document.getElementById("displayAge").innerHTML = "🔢 Age : " + (d.dob ? calculateAge(d.dob) + " years" : "—");
    document.getElementById("displayGender").innerHTML = "⚧ Gender : " + genderLabel(d.gender);
    document.getElementById("displayPhone").innerHTML = "📞 Phone : " + fieldOrDash(d.phone);
    document.getElementById("displayLocation").innerHTML = "📍 Location : " + fieldOrDash(d.address);
    document.getElementById("displayFarm").innerHTML = "🌾 Farm Area : " + fieldOrDash(d.farm);
    document.getElementById("displaySoil").innerHTML = "🪨 Soil Type : " + fieldOrDash(d.soil);
    document.getElementById("displayCrop").innerHTML = "🌱 Main Crop : " + fieldOrDash(d.crop);
    document.getElementById("displayIrrigation").innerHTML = "💧 Irrigation : " + fieldOrDash(d.irrigation);

    let image = document.getElementById("profileImage");
    let placeholder = document.getElementById("profileImagePlaceholder");

    if(d.profileImage){
        image.src = d.profileImage;
        image.style.display = "block";
        placeholder.style.display = "none";
    } else {
        image.style.display = "none";
        placeholder.style.display = "flex";
    }

}

// Logged-in farmer-oda profile-a backend-la irundhu edukkum.
(async function init(){

    const owner = getOwner();
    if(!owner){
        window.location.href = LOGIN_PAGE;
        return;
    }

    try{
        let r = await fetch(API_BASE + "/api/profile?owner=" + encodeURIComponent(owner));
        let j = await r.json();
        if(!r.ok) throw new Error((j.error && j.error.message) || "load failed");
        let data = j.profile || {};
        mirrorToLocal(data);
        render(data);
        document.getElementById("loadMsg").style.display = "none";
    }catch(e){
        console.error(e);
        document.getElementById("loadMsg").textContent = "Could not load your profile. Check your internet and refresh.";
        document.getElementById("loadMsg").style.color = "#c62828";
    }

})();

</script>


</body>
</html>
