from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import random
import os

app = Flask(__name__, static_folder='static')
CORS(app)

@app.route('/api/losowanie', methods=['POST'])
def losowanie():
    data = request.get_json()
    names = data['names']
    group_size = data['groupSize']
    random.shuffle(names)

    # Rozdziel kapitanów i nie-kapitanów
    captains = [name for name in names if name['isCaptain']]
    non_captains = [name for name in names if not name['isCaptain']]

    def create_groups(captains, non_captains, size):
        groups = []
        
        # Funkcja pomocnicza do dodawania osób do grup
        def add_to_group(person, group):
            if len(group) < size:
                group.append(person)
                return True
            return False

        # Tworzenie grup
        while non_captains or captains:
            group = []
            # Dodaj kapitana, jeśli są dostępni i nie ma jeszcze kapitana w grupie
            if captains:
                captain = captains.pop()
                group.append(captain)

            # Dodawanie nie-kapitanów do grupy
            for _ in range(size - len(group)):
                if non_captains:
                    person = non_captains.pop()
                    add_to_group(person, group)
                else:
                    break

            # Uzupełnianie grupy, jeśli nie jest pełna
            if len(group) < size:
                for _ in range(size - len(group)):
                    if non_captains:
                        person = non_captains.pop()
                        add_to_group(person, group)

            groups.append(group)

        return groups

    result = create_groups(captains, non_captains, group_size)
    
    # Zapisz wyniki do pliku .txt
    with open('results.txt', 'w') as file:
        for i, group in enumerate(result):
            file.write(f'Grupa {i + 1}:\n')
            for person in group:
                file.write(f"{'⭐ ' if person['isCaptain'] else ''}{person['name']}\n")
            file.write('\n')
    
    return jsonify(result)

@app.route('/download-results')
def download_results():
    return send_from_directory('.', 'results.txt', as_attachment=True)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5005)
