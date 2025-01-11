from app import create_app

if __name__ == '__main__':
    my_app = create_app()

    if my_app.config['DEBUG']:
        my_app.run('localhost', 5000)
    else:
        my_app.run('0.0.0.0')