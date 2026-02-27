import express, { Request, Response } from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Multer configuration (Memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('ADVERTENCIA: SUPABASE_URL o SUPABASE_KEY no están configurados en el archivo .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// API Endpoints

// GET /api/pets - Get all pets from Supabase
app.get('/api/pets', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('pets')
            .select('*')
            .order('fecha_registro', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error en GET /api/pets:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/pets - Register a new pet in Supabase
app.post('/api/pets', upload.single('foto_file'), async (req: Request, res: Response) => {
    const { nombre, raza, foto_url, descripcion, imageSource } = req.body;

    if (!nombre || !raza || !descripcion) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    let finalImageUrl = foto_url;

    try {
        // If uploading a file, use Supabase Storage
        if (imageSource === 'file' && req.file) {
            const fileName = `pets/${Date.now()}-${req.file.originalname}`;

            // Upload to 'pet-images' bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('app-dog-directory-storage')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get the public URL for the uploaded file
            const { data: publicUrlData } = supabase.storage
                .from('app-dog-directory-storage')
                .getPublicUrl(fileName);

            finalImageUrl = publicUrlData.publicUrl;
        }

        if (!finalImageUrl) {
            return res.status(400).json({ error: 'Se requiere una URL de imagen o un archivo' });
        }

        const { data, error } = await supabase
            .from('pets')
            .insert([
                {
                    nombre,
                    raza,
                    foto_url: finalImageUrl,
                    descripcion,
                    fecha_registro: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error: any) {
        console.error('Error en POST /api/pets:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/pets/:id - Mark as found (delete from Supabase)
app.delete('/api/pets/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('pets')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Mascota marcada como encontrada' });
    } catch (error: any) {
        console.error('Error en DELETE /api/pets:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/pets/:id/comments - Get comments for a pet
app.get('/api/pets/:id/comments', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('pet_id', id)
            .order('fecha_comentario', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error en GET /api/comments:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/pets/:id/comments - Add a comment to a pet
app.post('/api/pets/:id/comments', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { autor, contenido } = req.body;

    if (!autor || !contenido) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([{ pet_id: id, autor, contenido }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error: any) {
        console.error('Error en POST /api/comments:', error);
        res.status(500).json({ error: error.message });
    }
});

// For local dev and standard Express
app.listen(PORT, () => {
    console.log(`Servidor con Supabase corriendo en http://localhost:${PORT}`);
});

export default app;
