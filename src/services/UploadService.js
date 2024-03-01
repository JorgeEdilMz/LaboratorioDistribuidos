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
            const response = await axios.post(`http://159.54.140.202:3001/api/upload/${userId}`, formData, {
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
