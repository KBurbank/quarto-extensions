# find all the .html files directory "website" and make an html file listing them all
import yaml
import os
import glob

site_dir = os.getenv("QUARTO_PROJECT_OUTPUT_DIR")+"/lectures"


# find all the .html files in the "website" directory
all_files = glob.glob(site_dir+'/*.html')

# separate files into speaker, notes, and others
speaker_files = [file for file in all_files if '-speaker.html' in file]
notes_files = [file for file in all_files if '-notes.html' in file]
other_files = [file for file in all_files if file not in speaker_files + notes_files]

# create html list items for each category, excluding files starting with 'index' or 'dump'
speaker_files_list = [f"<li><a href='{os.path.basename(file)}'>{os.path.basename(file)}</a></li>" for file in speaker_files if not (os.path.basename(file).startswith('index') or os.path.basename(file).startswith('dump'))]
notes_files_list = [f"<li><a href='{os.path.basename(file)}'>{os.path.basename(file)}</a></li>" for file in notes_files if not (os.path.basename(file).startswith('index') or os.path.basename(file).startswith('dump'))]
other_files_list = [f"<li><a href='{os.path.basename(file)}'>{os.path.basename(file)}</a></li>" for file in other_files if not (os.path.basename(file).startswith('index') or os.path.basename(file).startswith('dump'))]

# join the list items with newline characters
speaker_files = "\n".join(speaker_files_list)
notes_files = "\n".join(notes_files_list)
other_files = "\n".join(other_files_list)

html = f"""
<div class='tab'>
    <button class='tablinks' onclick="openTab(event, 'Speaker')">Speaker</button>
    <button class='tablinks' onclick="openTab(event, 'Notes')">Notes</button>
    <button class='tablinks' onclick="openTab(event, 'Others')">Others</button>
</div>

<div id='Speaker' class='tabcontent'>
    <ul>{speaker_files}</ul>
</div>

<div id='Notes' class='tabcontent'>
    <ul>{notes_files}</ul>
</div>

<div id='Others' class='tabcontent'>
    <ul>{other_files}</ul>
</div>

<script>
function openTab(evt, tabName) {{
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {{
        tabcontent[i].style.display = 'none';
    }}

    // Add this code to display the content of the selected tab
    document.getElementById(tabName).style.display = 'block';
}}
window.onload = function() {{
    openTab(null, 'Others');
    }}
</script>
"""



    # The error is because you are trying to wrap the entire html_files string within <ul> tags.
    # You should write the html_files string directly to the file without the <ul> tags.

with open(site_dir+'/index.html', 'w') as f:
    f.write(html)