# Takes the non-speaker output file from a multiplexed output of revealjs, and makes another version which has the speaker notes showing but is otherwise a follower.

import os
def replace_show_notes_in_files(filenames):
    for filename in filenames:
        if filename.endswith(".html") and not filename.endswith("-speaker.html"):

            with open(filename, 'r') as file:
                file_data = file.read()

            if "showNotes: false" in file_data:
                file_data = file_data.replace("showNotes: false,", "showNotes: true,")

                base, ext = os.path.splitext(filename)
                new_filename = f"{base}-notes{ext}"

                with open(new_filename, 'w') as file:
                    file.write(file_data)

# Get filenames from QUARTO_PROJECT_OUTPUT_FILES environment variable

filenames = os.environ['QUARTO_PROJECT_OUTPUT_FILES'].split('\n')
replace_show_notes_in_files(filenames)