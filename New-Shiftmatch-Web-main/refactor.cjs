const fs = require('fs');
const file = 'src/pages/Dashboard2.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  'import DocumentTypes from "./Superadminview/DocumentTypes";',
  'import DocumentTypes from "./Superadminview/DocumentTypes";\nimport EditProfileModal from "../components/Modals/EditProfileModal";'
);

// 2. Remove states
const statesRegex = /const \[editProfileData.*?const profileInputRef = useRef\(null\);/s;
content = content.replace(statesRegex, '');

// 3. Remove functions: fetchStates, fetchCities, handleOpenEditModal, handleUploadProfileImage, handleSaveProfile, addressErrors, etc.
// Wait, regex might be tricky if there are nested braces. 
// Alternatively, I can just find the start index of "const fetchStates" and the end index of "const [isLoggingOut".
const startFuncs = content.indexOf('const fetchStates = async () => {');
const endFuncs = content.indexOf('const [isLoggingOut, setIsLoggingOut] = useState(false);');
if(startFuncs !== -1 && endFuncs !== -1) {
  content = content.slice(0, startFuncs) + content.slice(endFuncs);
}

// 4. Change handleOpenEditModal usage
content = content.replace(/onClick=\{handleOpenEditModal\}/g, 'onClick={() => setShowEditProfileModal(true)}');

// 5. Replace inline modal
const startModal = content.indexOf('{showEditProfileModal && (');
const endModal = content.indexOf('{/* LOGOUT MODAL */}');
if (startModal !== -1 && endModal !== -1) {
  const newModal = `{showEditProfileModal && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          currentUser={currentUser}
          onSuccess={fetchCurrentUser}
        />
      )}

      `;
  content = content.slice(0, startModal) + newModal + content.slice(endModal);
}

fs.writeFileSync(file, content);
console.log('Success');
