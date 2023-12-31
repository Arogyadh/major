from flask import Flask, request, jsonify, send_file
from PIL import Image
from flask_cors import CORS
import io
import base64
import time


import numpy as np
from tensorflow.keras.models import load_model
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


app = Flask(__name__)
CORS(app)

# Load the TensorFlow model
path = './generator_1.h5'
generator = load_model(path)

# Initialize plot_path as a global variable
plot_path = ''

def normalize_images(images):
    images = np.array(images)
    normalized_images = (images / 127.5) - 1
    return normalized_images

@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        # Get the image data from the request
        data = request.get_json()
        image_data_url = data['image']['dataUrl']
        stroke_colors = data['strokeColors']
        print(stroke_colors)

        # Convert the data URL to a NumPy array
        # decode image data from frontend to use pillow
        ip_img = Image.open(io.BytesIO(base64.b64decode(image_data_url.split(',')[1])))
        ip_img = ip_img.resize((256, 256))
        #convert to 3 channels
        ip_img = ip_img.convert('RGB')
        img = normalize_images(ip_img)
        img_array = np.array(img)
        img_array_batch = np.expand_dims(img_array, axis=0)

        # Predict using the model
        result = generator.predict(img_array_batch)

        # Assuming images are normalized to [-1, 1]
        processed_image = (result[0] * 0.5 + 0.5)

        # Convert NumPy array to PIL Image
        processed_image_pil = Image.fromarray((processed_image * 255).astype(np.uint8))

        # Plot and save the generated images
        plt.imshow(processed_image)
        plt.axis('off')
        

        # Save the plot as an image file
        timestamp = int(time.time())
        plot_path = f'path_to_plot_{timestamp}.png'
        plt.savefig(plot_path)
        plt.close()

        # Send the path of the saved image back to the frontend
        return jsonify({'processedImage': plot_path})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/<filename>')
def serve_plot(filename):
    return send_file(filename, mimetype='image/png')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)