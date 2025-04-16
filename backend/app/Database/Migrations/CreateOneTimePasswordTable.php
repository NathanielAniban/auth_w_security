<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateOneTimePasswordTable extends Migration{
    
    public function up()
    {
        $this->forge->addField([
            'id'          => ['type' => 'INT', 'auto_increment' => true],
            'profile_key' => ['type' => 'VARCHAR', 'constraint' => 150],
            'email'       => ['type' => 'VARCHAR', 'constraint' => 100],
            'type'        => ['type' => 'VARCHAR', 'constraint' => 150],
            'otp'         => ['type' => 'VARCHAR', 'constraint' => 6],
            'deleted_at'  => ['type' => 'DATETIME', 'null' => true],
            'created_at'  => [
                'type'    => 'DATETIME',
                'null'    => false,
                'default' => 'CURRENT_TIMESTAMP',
            ],
        ]);
        $this->forge->addKey('id', true); // Primary key
        $this->forge->createTable('one_time_password');
    }

    public function down()
    {
        $this->forge->dropTable('one_time_password');
    }

}