<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsersTable extends Migration{
    
    public function up()
    {
        $this->forge->addField([
            'index'       => ['type' => 'INT', 'auto_increment' => true],
            'profile_key'  => ['type' => 'VARCHAR', 'constraint' => 150],
            'email'        => ['type' => 'VARCHAR', 'constraint' => 100],
            'type'         => ['type' => 'VARCHAR', 'constraint' => 150],
            'first_name'   => ['type' => 'VARCHAR', 'constraint' => 150],
            'last_name'    => ['type' => 'VARCHAR', 'constraint' => 150],
            'password'     => ['type' => 'VARCHAR', 'constraint' => 150],
            'created_at'   => [
                'type'       => 'DATETIME',
                'null'       => false,
                'default'    => 'CURRENT_TIMESTAMP',
            ],
        ]);
        $this->forge->addKey('index', true); // Primary key
        $this->forge->createTable('users');
    }

    public function down()
    {
        $this->forge->dropTable('users');
    }

}