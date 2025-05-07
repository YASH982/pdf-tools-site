from PIL import Image

def convert_images_to_pdf(image_files, output_path):
    image_list = []

    for image_file in image_files:
        img = Image.open(image_file.stream).convert("RGB")
        image_list.append(img)

    if image_list:
        image_list[0].save(output_path, save_all=True, append_images=image_list[1:])
