let allPets = [];
let easyMDE;
let currentPetId = null;

// Fetch pets from API
async function fetchPets() {
    try {
        const response = await fetch('/api/pets');
        allPets = await response.json();
        renderGallery(allPets);
    } catch (error) {
        console.error('Error fetching pets:', error);
    }
}

// Render Gallery
function renderGallery(pets) {
    const gallery = document.getElementById('petGallery');

    if (pets.length === 0) {
        gallery.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="fas fa-search text-4xl text-gray-300 mb-4 block"></i>
                <p class="text-gray-500">No se encontraron perros con esos criterios.</p>
            </div>
        `;
        return;
    }

    gallery.innerHTML = pets.map(pet => `
        <div class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div class="h-64 overflow-hidden relative">
                <img src="${pet.foto_url}" alt="${pet.nombre}" class="w-full h-full object-cover">
                <div class="absolute bottom-4 left-4">
                    <span class="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">${pet.raza}</span>
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-2xl font-bold text-gray-800">${pet.nombre}</h3>
                    <span class="text-xs text-gray-400 font-medium"><i class="far fa-calendar-alt mr-1"></i>${new Date(pet.fecha_registro).toLocaleDateString()}</span>
                </div>
                <div class="text-gray-600 mb-4 prose prose-sm max-w-none line-clamp-3">
                    ${marked.parse(pet.descripcion)}
                </div>
                <div class="flex flex-col gap-2 pt-4 border-t border-gray-100">
                    <button onclick="deletePet('${pet.id}')" class="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2 rounded-lg transition border border-green-200">
                        <i class="fas fa-check-circle mr-1"></i> ¡Lo Encontré!
                    </button>
                    <button onclick="openDetailsModal('${pet.id}')" class="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2 rounded-lg transition">
                        <i class="fas fa-info-circle mr-1"></i> Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Search/Filter Logic
function filterPets() {
    const nameFilter = document.getElementById('nameSearch').value.toLowerCase();
    const breedFilter = document.getElementById('breedSearch').value.toLowerCase();

    const filteredPets = allPets.filter(pet => {
        const matchesName = pet.nombre.toLowerCase().includes(nameFilter);
        const matchesBreed = pet.raza.toLowerCase().includes(breedFilter);
        return matchesName && matchesBreed;
    });

    renderGallery(filteredPets);
}

document.getElementById('nameSearch').addEventListener('input', filterPets);
document.getElementById('breedSearch').addEventListener('input', filterPets);

// Delete Pet (Mark as Found)
async function deletePet(id) {
    if (!confirm('¿Estás seguro de que quieres marcar a esta mascota como encontrada? Se eliminará del directorio.')) return;

    try {
        const response = await fetch(`/api/pets/${id}`, { method: 'DELETE' });
        if (response.ok) {
            allPets = allPets.filter(pet => pet.id !== id);
            filterPets();
            alert('¡Qué gran noticia! Gracias por avisar.');
        } else {
            alert('Error al procesar la solicitud.');
        }
    } catch (error) {
        console.error('Error deleting pet:', error);
        alert('Error en la conexión.');
    }
}

// Details & Comments Logic
async function openDetailsModal(petId) {
    const pet = allPets.find(p => p.id === petId);
    if (!pet) return;

    currentPetId = petId;

    // Fill pet info
    document.getElementById('detailImage').src = pet.foto_url;
    document.getElementById('detailImage').alt = pet.nombre;
    document.getElementById('detailNombre').innerText = pet.nombre;
    document.getElementById('detailRaza').innerText = pet.raza;
    document.getElementById('detailFecha').innerText = new Date(pet.fecha_registro).toLocaleDateString();
    document.getElementById('detailDescripcion').innerHTML = marked.parse(pet.descripcion);

    // Reset comments
    document.getElementById('commentsList').innerHTML = '<p class="text-center text-gray-400 py-10">Cargando comentarios...</p>';

    openModal('detailsModal');

    // Fetch comments
    fetchComments(petId);
}

async function fetchComments(petId) {
    try {
        const response = await fetch(`/api/pets/${petId}/comments`);
        const comments = await response.json();
        renderComments(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

function renderComments(comments) {
    const list = document.getElementById('commentsList');

    if (comments.length === 0) {
        list.innerHTML = `
            <div class="text-center py-10 text-gray-400">
                <i class="far fa-comment-dots text-2xl mb-2"></i>
                <p>Nadie ha comentado aún. ¡Sé el primero!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = comments.map(comment => `
        <div class="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-purple-700 text-sm">${comment.autor}</span>
                <span class="text-[10px] text-gray-400">${new Date(comment.fecha_comentario).toLocaleString()}</span>
            </div>
            <p class="text-gray-700 text-sm">${comment.contenido}</p>
        </div>
    `).join('');

    // Scroll to bottom
    list.scrollTop = list.scrollHeight;
}

document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentPetId) return;

    const formData = new FormData(e.target);
    const commentData = {
        autor: formData.get('autor'),
        contenido: formData.get('contenido')
    };

    try {
        const response = await fetch(`/api/pets/${currentPetId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commentData)
        });

        if (response.ok) {
            e.target.reset();
            // Refetch comments
            fetchComments(currentPetId);
        } else {
            alert('Error al publicar comentario.');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
});

// Modal Control
function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Toggle Image Source
let imageSource = 'url';
function setImageSource(source) {
    imageSource = source;
    const btnUrl = document.getElementById('btnSourceUrl');
    const btnFile = document.getElementById('btnSourceFile');
    const containerUrl = document.getElementById('inputUrlContainer');
    const containerFile = document.getElementById('inputFileContainer');
    const inputUrl = document.getElementById('foto_url_input');
    const inputFile = document.getElementById('foto_file_input');

    if (source === 'url') {
        btnUrl.className = 'flex-1 py-1 rounded-md text-sm font-semibold transition bg-white shadow-sm text-purple-700';
        btnFile.className = 'flex-1 py-1 rounded-md text-sm font-semibold transition text-gray-500 hover:text-gray-700';
        containerUrl.classList.remove('hidden');
        containerFile.classList.add('hidden');
        inputUrl.required = true;
        inputFile.required = false;
        inputFile.value = '';
    } else {
        btnFile.className = 'flex-1 py-1 rounded-md text-sm font-semibold transition bg-white shadow-sm text-purple-700';
        btnUrl.className = 'flex-1 py-1 rounded-md text-sm font-semibold transition text-gray-500 hover:text-gray-700';
        containerFile.classList.remove('hidden');
        containerUrl.classList.add('hidden');
        inputFile.required = true;
        inputUrl.required = false;
        inputUrl.value = '';
    }
}

// Form Submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Get description from EasyMDE
    const description = easyMDE.value().trim();
    if (!description) {
        alert('Por favor, añade una descripción.');
        return;
    }
    formData.set('descripcion', description);

    // Add image source type
    formData.append('imageSource', imageSource);

    try {
        const response = await fetch('/api/pets', {
            method: 'POST',
            body: formData // No Content-Type header needed, browser sets it for FormData
        });

        if (response.ok) {
            const newPet = await response.json();
            allPets.unshift(newPet); // Add to beginning
            renderGallery(allPets);
            closeModal('registerModal');
            e.target.reset();
            easyMDE.value(''); // Clear editor
            setImageSource('url'); // Reset source toggle
            alert('¡Perro registrado con éxito!');
        } else {
            const errorData = await response.json();
            alert('Error al registrar el perro: ' + (errorData.error || 'Desconocido'));
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Hubo un error en la conexión.');
    }
});

// Initialize
function init() {
    easyMDE = new EasyMDE({
        element: document.getElementById('descripcionInput'),
        spellChecker: false,
        autosave: { enabled: true, uniqueId: "petDescription" },
        placeholder: "Describe al perro (colores, señas particulares, lugar donde se vio...)",
        status: false,
        minHeight: "150px"
    });
    fetchPets();
}

init();
