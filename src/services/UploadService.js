import axios from 'axios'

class UploadService {


    async updateImg(userId, image, token) {
        if (!image) {
            console.error('No se ha seleccionado ningún archivo.');
            return;
        }
        const formData = new FormData();
        formData.append('image', image);
        try {
            const response = await axios.post(`https://api-usuarios-8o5p.onrender.com/api/upload/${userId}`, formData, {
                headers: {
                    'Content-Type': 'Application/json',
                    'Authorization': `${token}`,
                },
            });
            if (response.status === 200) {
                console.log('Imagen del usuario actualizada con éxito.');
            }
        } catch (error) {
            console.error('Error al actualizar la imagen del usuario:', error);
        }
    }


}

export default new UploadService();